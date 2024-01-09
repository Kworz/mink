import { articleIncludeQuery, computeArticlePrice } from "$lib/components/derived/article/article";
import { LabelDocument } from "$lib/label/labelDocument";
import type jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals }) => {

    try
    {
        const order = await locals.prisma.scm_order.findUnique({ where: { id: params.id }, include: { supplier: true, order_rows: { include: { article: { include: articleIncludeQuery }, project: true }}}});

        if(order === null) return new Response("Could not find order " + params.id, { status: 404})

        const doc = new LabelDocument(297, 210, "p") as (jsPDF & LabelDocument);

        autoTable(doc, { 
            theme: "grid",
            styles: { font: "NotoSansSymbols-SemiBold", fontSize: 10 },
            margin: { top: 70, left: 7.5, right: 7.5, bottom: 10 },
            headStyles: { fillColor: [0, 0, 0] },
            footStyles: { fillColor: [139, 92, 246] },
            head: [["Projet", "Désignation", "Référence", "Quantité", "Délai", "UO", "Prix Unitaire", "Prix total"]],
            body: order.order_rows.map(row => [row.project?.name ?? "—", row.article.name, row.article.reference, row.needed_quantity, (row.needed_date) ? row.needed_date : "—", "U", `${round(computeArticlePrice(row.article.order_rows), 2)} €`, `${round(row.needed_quantity * computeArticlePrice(row.article.order_rows), 2)} €`]),
            foot: [
                ["Total HT", { content: `${round(order.order_rows.reduce((acc, row) => acc + (row.needed_quantity * computeArticlePrice(row.article.order_rows)), 0), 2)} €`, colSpan: 7, styles: { halign: "right" }}],
                ["TVA 20%", { content: `${round(order.order_rows.reduce((acc, row) => acc + (row.needed_quantity * computeArticlePrice(row.article.order_rows)), 0) * 0.2, 2)} €`, colSpan: 7, styles: { halign: "right" }}],
                ["Total TTC", { content: `${round(order.order_rows.reduce((acc, row) => acc + (row.needed_quantity * computeArticlePrice(row.article.order_rows)), 0) * 1.2, 2)} €`, colSpan: 7, styles: { halign: "right" }}]
            ],
            showFoot: "lastPage",
        });

        const pages = doc.getNumberOfPages();

        for(let i = 1; i <= pages; i++)
        {
            doc.setPage(i);

            doc.setFontSize(26);
            doc.setFont("NotoSansSymbols-SemiBold");
            doc.setTextColor(0xCC, 0xCC, 0xCC);
            doc.text("BON DE COMMANDE", 7.5, 12.5);

            doc.setTextColor(0x22, 0x22, 0x22);
            doc.setFontSize(12);
            doc.text(`Commande n° ${order.name}`, 7.5, 20);
            doc.text(`Date: ${date(Date.now())}`, 7.5, 25);

            doc.setFillColor(139, 92 ,246);
            doc.rect(7.5, 15, 195, 0.5, "F");
            doc.rect(7.5, 37, 90, 0.5, "F");
            doc.rect(210 / 2 + 7.5, 37, 90, 0.5, "F");
            doc.setFillColor(0x33, 0x33, 0x33);

            doc.setFontSize(14);
            doc.text(order.supplier.name, 7.5, 35);
            doc.text(locals.appSettings.appCompanyName, 210 / 2 + 7.5, 35);
            doc.setFontSize(12);

            if(order.supplier.address) doc.text(order.supplier.address.split(", "), 7.5, 52);
            doc.text(locals.appSettings.appCompanyAddress.split(", "), 210 / 2 + 7.5, 52);

            doc.setTextColor(139, 92 ,246)
            if(order.supplier.email) doc.textWithLink(order.supplier.email, 7.5, 45, { url: `mailto:${order.supplier.email}` })
            doc.textWithLink(`Suivi par ${locals.session?.user.email}`, 210 / 2 + 7.5, 45, { url: `mailto:${locals.session?.user.email}` })
            doc.setTextColor(0x22, 0x22, 0x22);

            doc.setFontSize(10);
            doc.text("Page " + i + "/" + pages, 202.5, 290, { align: "right" });
        }

        const documentData = doc.output();

        return new Response(documentData, { headers: { 
            "content-type": "application/pdf; charset=utf-8",
            "Content-Disposition": "inline; filename=order.pdf"
        }});
    }
    catch(ex){
        console.error(ex);
        return new Response("Internal server error", { status: 500 });
    }

};

function round(value: number, decimals: number) {
    //Return a rounded number of decimals
    return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}

function date(dateToFormat: number | string) {
    return new Intl.DateTimeFormat('fr-FR').format(new Date(dateToFormat))
}