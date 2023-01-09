import { Collections, type ListRowResponse, type ListResponse, type NomenclatureRowResponse } from "$lib/DBTypes";
import type { RequestHandler } from "@sveltejs/kit";

import xlsx from "node-xlsx";

export const GET: RequestHandler = async ({ params, locals }) => {

    try
    {        
        const list = await locals.pb.collection(Collections.List).getOne<ListResponse>(params.id, {
            expand: "parent_nomenclature"
        });

        const list_rows = await locals.pb.collection(Collections.ListRow).getFullList<ListRowResponse>(undefined, {
            filter: `parent_list="${params.id}"`,
        });

        const nomenclature_rows = await locals.pb.collection(Collections.NomenclatureRow).getFullList<NomenclatureRowResponse>(undefined, {
            filter: `parent_nomenclature="${list.parent_nomenclature}"`,
            expand: `child_article`
        });

        const excel: (string | number)[][] = [];

        excel.push(["Liste", sanitizeString(list.name)]);
        excel.push(["Nomenclature de base", list.expand?.parent_nomenclature.name]);
        excel.push([]);
        excel.push(["Désignation", "Quantitée présente", "Quantité requise", "Quantité a commander", "Validé ?", "Fabriquant", "Fournisseur", "Référence", "Prix"])

        for(const nomRow of nomenclature_rows)
        {
            const list_row_article = list_rows.find(lr => lr.parent_nomenclature_row === nomRow.id);

            excel.push([
                nomRow.expand?.child_article.name,
                list_row_article?.quantity ?? 0,
                nomRow.quantity_required,
                (nomRow.quantity_required - (list_row_article?.quantity ?? 0)),
                nomRow.quantity_required - (list_row_article?.quantity ?? 0) == 0 ? "Oui" : "Non",
                nomRow.expand?.child_article.manufacturer,
                nomRow.expand?.child_article.supplier,
                nomRow.expand?.child_article.reference,
                nomRow.expand?.child_article.price
            ]);
        }

        const sheetOptions = {
            '!cols': [{wch: 80}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}]
        };

        const buffer = xlsx.build([{name: "Liste " + sanitizeString(list.name), data: excel, options: sheetOptions}]);

        return new Response(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": "inline; filename=Liste - " + sanitizeString(list.name) + ".xlsx"
            }
        })
    }
    catch(ex)
    {
        return new Response(String(ex), {
            status: 500,
        });
    }

}

function sanitizeString(str: string){
    str = str.replace(/[^a-z0-9áéíóúñü .,_-]/gim,"");
    return str.trim();
}