import type { RequestHandler } from "./$types";
import { Collections } from "$lib/DBTypes";
import type { ArticleResponseExpanded } from "../+page.server";

import qrcode from "qrcode";

import jsPDF, { type TextOptionsLight } from "jspdf";
import { font } from "./noto-b64";

function mmToPt(mm: number)
{
    return mm / 0.3527777778;
}

function printResizeText(doc: jsPDF, text: string, maxHeight: number, maxWidth: number, x: number, y:number, o: TextOptionsLight | undefined)
{
    let h = maxHeight;
    doc.setFontSize(mmToPt(h));

    while(doc.getTextWidth(text) > maxWidth)
    {
        h = h - 0.25;
        doc.setFontSize(mmToPt(h));
    }

    doc.text(text,x,y,o);
}

export const GET: RequestHandler = async ({ url, locals }) => {

    const articlesIDS = url.searchParams.get("articles");

    if(articlesIDS === null)
        return new Response("Wrong request", { status: 400 });

    const articles: Array<ArticleResponseExpanded> = [];

    for(const article of articlesIDS.split(","))
    {
        articles.push(await locals.pb.collection(Collections.Article).getOne<ArticleResponseExpanded>(article, { expand: "supplier"}))
    }

    const document = new jsPDF({
        orientation: 'l',
        unit: 'mm',
        format: [57, 32],
        filters: ["ASCIIHexEncode"]
    });

    for(const [index, article] of articles.entries())
    {
        const QRCode = await qrcode.toDataURL(article.id, { "type": "image/png", "margin": 4 });

        document.addImage(QRCode, 2, 2, 18, 18);

        document.addFileToVFS('mplus-medium.ttf', font);
        document.addFont('mplus-medium.ttf', 'NotoSansSymbols-SemiBold', 'normal');
        
        document.setFont('NotoSansSymbols-SemiBold', "normal");

        printResizeText(document, article.manufacturer ?? "", 6, 31, 38.5, 8, { align: "center" });
        printResizeText(document, article.reference ?? "", 6, 31, 38.5, 16, { align: "center" });

        printResizeText(document, article.name, 8, 51, 28.5, 28, { align: "center" });

        if(index + 1 < articles.length)
            document.addPage();        
    }

    const documentData = document.output();

    return new Response(documentData, { headers: { 
        "content-type": "application/pdf; charset=utf-8",
        "Content-Disposition": "inline; filename=labels.pdf"
    }})
}