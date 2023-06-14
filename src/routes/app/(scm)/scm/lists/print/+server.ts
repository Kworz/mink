import type { RequestHandler } from "./$types";
import { Collections } from "$lib/DBTypes";

import { LabelDocument } from "$lib/label/labelDocument";
import type { AssembliesBuylistsResponseExpanded } from "../+page.server";
import type jsPDF from "jspdf";

export const GET: RequestHandler = async ({ url, locals }) => {

    const listsIDS = url.searchParams.get("lists");

    if(listsIDS === null)
        return new Response("Wrong request", { status: 400 });

    const lists: Array<AssembliesBuylistsResponseExpanded> = [];

    for(const list of listsIDS.split(","))
    {
        lists.push(await locals.pb.collection(Collections.AssembliesBuylists).getOne<AssembliesBuylistsResponseExpanded>(list, { expand: "project,assembly"}))
    }

    const label = new LabelDocument(59, 102) as (jsPDF & LabelDocument);

    for(const [index, list] of lists.entries())
    {
        //get avatar from pocketbase and add it to the label
        const url = locals.pb.getFileUrl(list.expand?.assembly, list.expand?.assembly.thumbnail);

        const response = await fetch(url);
        const blob = await response.arrayBuffer();

        label.addImage(new Uint8Array(blob), "PNG", 5, 5, 25, 25);

        await label.addQRCode(`list:${list.id}`, 5, 32.5, 25);

        label.printResizeText("Liste d'achat", 7, 50, 65, 15, { align: "center" });
        label.printResizeText(list.expand?.assembly?.name, 8, 50, 65, 25, { align: "center" });

        label.printResizeText(list.name, 8, 50, 65, 42.5, { align: "center" });
        label.printResizeText(`Affaire: ${list.expand?.project?.name ?? "—"}`, 7, 50, 65, 50, { align: "center" });

        if(index + 1 < lists.length)
            label.addPage();        
    }

    const documentData = label.output();

    return new Response(documentData, { headers: { 
        "content-type": "application/pdf; charset=utf-8",
        "Content-Disposition": "inline; filename=labels.pdf"
    }});
}