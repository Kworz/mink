import { Collections, type ArticleResponse } from "$lib/DBTypes";
import { articleResponseExpand, type ArticleResponseExpanded } from "$lib/components/article/ArticleRow.svelte";
import type { RequestHandler } from "@sveltejs/kit";

import xlsx from "node-xlsx";

export const GET: RequestHandler = async ({ locals }) => {

    try
    {        
        const articles = await locals.pb.collection(Collections.Article).getFullList<ArticleResponseExpanded>({ expand: articleResponseExpand });

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
                article.name,
                article.manufacturer ?? "",
                article.expand?.["article_suppliers(article)"]?.map(k => k.supplier).join(", ") ?? "",
                article.expand?.["article_store_quantity(article)"]?.[0].quantity ?? 0,
                article.reference ?? "",
                article.expand?.["article_price(article)"]?.[0].price ?? article.price ?? 0,
                (article.expand?.["article_store_quantity(article)"]?.[0].quantity ?? 0) * (article.expand?.["article_price(article)"]?.[0].price ?? article.price ?? 0)
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