import type { RequestHandler } from "./$types";

import { LabelDocument } from "$lib/label/labelDocument";
import type jsPDF from "jspdf";
import { env } from "$env/dynamic/public";
import type { SCMArticle } from "@prisma/client";

export const GET: RequestHandler = async ({ url, locals }) => {

    const articlesIDS = url.searchParams.get("articles");
    const images = (url.searchParams.get("images") ?? "false") === "true";

    if(articlesIDS === null)
        return new Response("Wrong request", { status: 400 });

    const articles: Array<SCMArticle> = [];

    for(const article of articlesIDS.split(","))
    {
        articles.push(await locals.prisma.sCMArticle.findFirstOrThrow({ where: { id: article } }));
    }

    const label = new LabelDocument(32, 57) as (jsPDF & LabelDocument);

    for(const [index, article] of articles.entries())
    {
        if(images && article.thumbnail !== null)
        {
            const response = await fetch(article.thumbnail);

            if(response.status === 200)
            {
                const blob = await response.arrayBuffer();
                label.addImage(new Uint8Array(blob), "PNG", 2, 2, 18, 18);
            }
            else
                await label.addQRCode("scm:article:" + article.id, 2, 2, 18);
        }
        else
            await label.addQRCode(article.id, 2, 2, 18);

        label.printResizeText((article.internal) ? env.PUBLIC_COMPANY_NAME : (article.brand ?? ""), 6, 31, 38.5, 8, { align: "center" });
        label.printResizeText(article.reference ?? "", 6, 31, 38.5, 16, { align: "center" });
        label.printResizeText(article.name ?? "", 8, 51, 28.5, 28, { align: "center" });

        if(index + 1 < articles.length)
            label.addPage();        
    }

    const documentData = label.output();

    return new Response(documentData, { headers: { 
        "content-type": "application/pdf; charset=utf-8",
        "Content-Disposition": "inline; filename=labels.pdf"
    }})
}