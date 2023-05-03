import { Collections, type AssembliesBuylistsRowsResponse } from "$lib/DBTypes";
import type { RequestHandler } from "@sveltejs/kit";

import xlsx, { type WorkSheetOptions } from "node-xlsx";
import type { AssembliesBuylistsResponseExpanded } from "../../+page.server";
import { flattenAssembly } from "$lib/components/assemblies/assemblyFlatener";

export const GET: RequestHandler = async ({ params, locals }) => {

    try
    {        
        const list = await locals.pb.collection(Collections.AssembliesBuylists).getOne<AssembliesBuylistsResponseExpanded>(params.id, { expand: "assembly,project"});
        const listItems = await locals.pb.collection(Collections.AssembliesBuylistsRows).getFullList<AssembliesBuylistsRowsResponse>({ filter: `buylist = "${list.id}"`});
        const flattenAssemblyResult = await flattenAssembly(list.expand?.assembly, locals.pb);

        const excel: (string | number)[][] = [];

        excel.push(["Liste", sanitizeString(list.name)]);
        excel.push(["Nomenclature de base", list.expand?.assembly.name]);
        excel.push([]);
        excel.push(["Désignation", "Quantitée présente", "Quantité requise", "Validé ?", "Fabriquant", "Fournisseur", "Référence", "Prix"])

        for(const far of flattenAssemblyResult)
        {
            const listRelationArticle = listItems.find(k => k.article === far.article.id);

            excel.push([
                far.article.name,
                listRelationArticle?.quantity ?? 0,
                far.quantity,
                far.quantity <= (listRelationArticle?.quantity ?? 0) ? "Oui" : "Non",
                far.article.manufacturer ?? "",
                far.article.expand?.supplier?.map(k => k.name).join(", ") ?? "",
                far.article.reference ?? "",
                far.article.price ?? 0
            ]);
        }

        const sheetOptions = {
            '!cols': [{wch: 80}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}]
        } satisfies WorkSheetOptions;

        const buffer = xlsx.build([{name: "Liste", data: excel, options: sheetOptions}]);

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