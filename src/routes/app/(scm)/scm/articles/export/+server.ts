import { articleIncludeQuery, computeArticlePrice } from "$lib/components/derived/article/article";
import type { RequestHandler } from "@sveltejs/kit";

import xlsx from "node-xlsx";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const GET: RequestHandler = async ({ url, locals }) => {

    try
    {        
        const articleIds = url.searchParams.has("articles") ? url.searchParams.get("articles") : undefined;

        let filter = {};

        if(articleIds !== null && articleIds !== undefined && articleIds !== "")
            filter = { where: { id: { in: articleIds.split(",") }}};

        const articles = await locals.prisma.scm_article.findMany({ include:  articleIncludeQuery, ...filter });

        console.log(articles, filter);

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

            const articleQuantity = article.store_relations.reduce((p, c) => p + c.quantity, 0);
            const articlePrice = computeArticlePrice(article.order_rows);

            excel.push([
                article.id,
                article.name || "",
                article.brand || "",
                "No supplier exported",
                articleQuantity,
                article.reference || "",
                articlePrice,
                articlePrice * articleQuantity
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