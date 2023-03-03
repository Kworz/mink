import type { RequestHandler } from "./$types";
import { Collections } from "$lib/DBTypes";
import type { ArticleResponseExpanded } from "../+page.server";

import { LabelDocument } from "$lib/label/labelDocument";

export const GET: RequestHandler = async ({ url, locals }) => {

    const articlesIDS = url.searchParams.get("articles");

    if(articlesIDS === null)
        return new Response("Wrong request", { status: 400 });

    const articles: Array<ArticleResponseExpanded> = [];

    for(const article of articlesIDS.split(","))
    {
        articles.push(await locals.pb.collection(Collections.Article).getOne<ArticleResponseExpanded>(article, { expand: "supplier"}))
    }

    const label = new LabelDocument(32, 57);

    console.log(label.addQRCode);

    for(const [index, article] of articles.entries())
    {
        await label.addQRCode(article.id, 2, 2, 18);

        label.printResizeText(article.manufacturer, 6, 31, 38.5, 8, { align: "center" });
        label.printResizeText(article.reference, 6, 31, 38.5, 16, { align: "center" });
        label.printResizeText(article.name, 8, 51, 28.5, 28, { align: "center" });

        if(index + 1 < articles.length)
            label.addPage();        
    }

    const documentData = label.output();

    return new Response(documentData, { headers: { 
        "content-type": "application/pdf; charset=utf-8",
        "Content-Disposition": "inline; filename=labels.pdf"
    }})
}