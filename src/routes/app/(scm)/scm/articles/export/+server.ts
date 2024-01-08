import { articleIncludeQuery } from "$lib/components/article/article";
import type { RequestHandler } from "@sveltejs/kit";

import xlsx from "node-xlsx";

export const GET: RequestHandler = async ({ locals }) => {

    try
    {        
        const articles = await locals.prisma.scm_article.findMany({ include:  articleIncludeQuery });

        const excel: (string | number)[][] = [];

        excel.push(["Liste des articles"]);
        excel.push([]);
        excel.push([
            "ID", 
            "Désignation", 
            "Fabriquant", 
            "Fournisseur", 
            "Référence", 
            "Quantité en stock", 
            "Prix",
            "TOTAL"
        ]);

        for(const article of articles)
        {
            excel.push([
                article.id,
                article.name || "",
                article.brand || "",
                "No supplier exported",
                article.store_relations.filter(sr => sr.store.temporary === false).reduce((p, c) => p + c.quantity, 0),
                article.reference || "",
                "Article PUMP not computed",
                "Article total price not computed"
            ]);
        }

        const sheetOptions = {
            '!cols': [{wch: 20}, {wch: 80}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}]
        };

        const buffer = xlsx.build([{name: "Liste des articles", data: excel, options: sheetOptions}]);

        return new Response(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": "inline; filename=Liste des articles.xlsx"
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