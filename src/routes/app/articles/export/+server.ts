import { Collections, type ArticleResponse } from "$lib/DBTypes";
import type { RequestHandler } from "@sveltejs/kit";

import xlsx from "node-xlsx";

export const GET: RequestHandler = async ({ locals }) => {

    try
    {        
        const articles = await locals.pb.collection(Collections.Article).getFullList<ArticleResponse>();

        const excel: (string | number)[][] = [];

        excel.push(["Liste des articles"]);
        excel.push([]);
        excel.push(["ID", "Désignation", "Quantité en stock", "Fabriquant", "Fournisseur", "Référence", "Prix"])

        for(const article of articles)
        {
            excel.push([
                article.id,
                article.name,
                article.quantity,
                article.manufacturer ?? "",
                article.supplier ?? "",
                article.reference ?? "",
                article.price ?? ""
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