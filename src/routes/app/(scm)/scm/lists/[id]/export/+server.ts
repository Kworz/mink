import type { RequestHandler } from "@sveltejs/kit";

import xlsx, { type WorkSheetOptions } from "node-xlsx";
import { flatAssembly } from "$lib/components/assemblies/flattenAssembly";

export const GET: RequestHandler = async ({ params, locals }) => {

    try
    {   
        if(params.id === undefined)
            return new Response("Missing list ID", { status: 400 });

        const list = await locals.prisma.scm_assembly_buylist.findUnique({ where: { id: params.id }, include: { assembly: true, project: true }});

        if(list === null)
            return new Response("List not found", { status: 404 });

        const listStoreRelations = await locals.prisma.scm_store_relation.findMany({ where: { store_id: list.store_id }, include: { article: true }});

        const flatAssemblyRows = await flatAssembly(list.assembly_id, locals.prisma);

        const excel: (string | number)[][] = [];

        excel.push(["Liste", sanitizeString(list.name)]);
        excel.push(["Nomenclature de base", list.assembly.name]);
        excel.push([]);
        excel.push(["Désignation", "Quantitée présente", "Quantité requise", "Quantité a commander", "Validé ?", "Fabriquant", "Fournisseur", "Référence", "Prix"])

        for(const far of flatAssemblyRows)
        {
            const listRelationArticle = listStoreRelations.find(k => k.article_id === far.article_child_id);

            excel.push([
                far.article_child.name ?? "",
                listRelationArticle?.quantity ?? 0,
                far.quantity,
                far.quantity <= (listRelationArticle?.quantity ?? 0) ? "Oui" : "Non",
                far.article_child.internal ? locals.appSettings.appCompanyName : (far.article_child.brand ?? ""),
                "Suppliers are empty for now",
                far.article_child.reference ?? "",
                "Article prices are empty for now"
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