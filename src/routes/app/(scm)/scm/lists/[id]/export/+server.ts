import type { RequestHandler } from "@sveltejs/kit";

import xlsx, { type WorkSheetOptions } from "node-xlsx";
import { flattenAssembly } from "$lib/components/derived/assemblies/flattenAssembly";
import { articleIncludeQuery, computeArticlePrice } from "$lib/components/derived/article/article";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const GET: RequestHandler = async ({ params, locals }) => {

    try
    {   
        if(params.id === undefined)
            return new Response("Missing list ID", { status: 400 });

        const list = await locals.prisma.scm_assembly_buylist.findUnique({ where: { id: params.id }, include: { assembly: true, project: true }});

        if(list === null)
            return new Response("List not found", { status: 404 });

        const listStoreRelations = await locals.prisma.scm_store_relation.findMany({ where: { store_id: list.store_id }, include: { article: true }});

        const flatAssemblyRelations = await flattenAssembly(list.assembly_id, locals.prisma);

        const articles = await locals.prisma.scm_article.findMany({ where: { id: { in: Object.keys(flatAssemblyRelations) }}, include: articleIncludeQuery });

        const excel: (string | number)[][] = [];

        excel.push(["Liste", sanitizeString(list.name)]);
        excel.push(["Nomenclature de base", list.assembly.name]);
        excel.push(["——————————————————————————————————"]);
        excel.push(["Désignation", "Quantitée présente", "Quantité requise", "Quantité a commander", "Validé ?", "Fabriquant", "Fournisseur", "Référence", "Prix"])

        for(const article of articles)
        {
            const listRelationArticle = listStoreRelations.find(k => k.article_id === article.id);
            const flattenAssemblyRelation = flatAssemblyRelations[article.id];

            excel.push([
                article.name ?? "",
                listRelationArticle?.quantity ?? 0,
                flattenAssemblyRelation.requiredQuantity,
                flattenAssemblyRelation.requiredQuantity - (listRelationArticle?.quantity ?? 0),
                flattenAssemblyRelation.requiredQuantity <= (listRelationArticle?.quantity ?? 0) ? "Oui" : "Non",
                article.internal ? locals.appSettings!.company_name : (article.brand ?? ""),
                [...new Set(article.order_rows.map(k => k.order.supplier.name))].join(", "),
                article.reference ?? "",
                computeArticlePrice(article.order_rows)
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