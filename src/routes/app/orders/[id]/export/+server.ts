import { Collections, type OrdersResponse } from "$lib/DBTypes";
import { LabelDocument } from "$lib/label/labelDocument";
import type jsPDF from "jspdf";
import type { OrderRowsResponseExpanded } from "../../../approx/+page.server";
import type { RequestHandler } from "./$types";

import autoTable from "jspdf-autotable";
import type { OrdersResponseExpanded } from "../../+page.server";

export const GET: RequestHandler = async ({ params, locals }) => {

    try
    {
        const order = await locals.pb.collection(Collections.Orders).getOne<OrdersResponseExpanded>(params.id, { expand: "issuer,orders_rows(order).article,supplier" });
        const orderRows = await locals.pb.collection(Collections.OrdersRows).getFullList<OrderRowsResponseExpanded>(undefined, { filter: `order = "${order.id}"`, expand: "article,project" });

        const doc = new LabelDocument(297, 210, "p") as (jsPDF & LabelDocument);

        autoTable(doc, { 
            theme: "grid",
            styles: { font: "NotoSansSymbols-SemiBold", fontSize: 10},
            margin: { top: 70, left: 7.5, right: 7.5, bottom: 10 },
            headStyles: { fillColor: [0, 0, 0] },
            footStyles: { fillColor: [139, 92, 246] },
            head: [["Projet", "Désignation", "Référence", "Quantité", "Délai", "UO", "Prix Unitaire", "Prix total"]],
            body: orderRows.map(row => [row.expand?.project?.name ?? "—", row.expand?.article.name, row.expand?.article.reference, row.quantity, (row.needed_date) ? date(row.needed_date) : "—", "U", `${round(row.expand?.article.price, 2)} €`, `${round(row.quantity * (row.expand?.article.price ?? 0), 2)} €`]),
            foot: [
                ["Total HT", { content: `${round(orderRows.reduce((acc, row) => acc + (row.quantity * (row.expand?.article.price ?? 0)), 0), 2)} €`, colSpan: 7, styles: { halign: "right" }}],
                ["TVA 20%", { content: `${round(orderRows.reduce((acc, row) => acc + (row.quantity * (row.expand?.article.price ?? 0)), 0) * 0.2, 2)} €`, colSpan: 7, styles: { halign: "right" }}],
                ["Total TTC", { content: `${round(orderRows.reduce((acc, row) => acc + (row.quantity * (row.expand?.article.price ?? 0)), 0) * 1.2, 2)} €`, colSpan: 7, styles: { halign: "right" }}]
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
            doc.text(order.expand?.supplier.name, 7.5, 35);
            doc.text(import.meta.env.VITE_COMPANY_NAME ?? ".env empty", 210 / 2 + 7.5, 35);
            doc.setFontSize(12);

            doc.text(order.expand?.supplier.address?.split(", "), 7.5, 52);
            doc.text(import.meta.env.VITE_COMPANY_ADDRESS?.split(", "), 210 / 2 + 7.5, 52);

            doc.setTextColor(139, 92 ,246)
            doc.textWithLink(order.expand?.supplier.contact_email, 7.5, 45, { url: `mailto:${order.expand?.supplier.contact_email}` })
            doc.textWithLink(`Suivi par ${locals.user?.email}`, 210 / 2 + 7.5, 45, { url: `mailto:${locals.user?.email}` })
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
    }

};

function round(value: number, decimals: number) {
    //Return a rounded number of decimals
    return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}

function date(dateToFormat: number | string) {
    return new Intl.DateTimeFormat('fr-FR').format(new Date(dateToFormat))
}