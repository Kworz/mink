import type { RequestHandler } from "./$types";
import { LabelDocument } from "$lib/label/labelDocument";
import { Prisma } from "@prisma/client";
import type jsPDF from "jspdf";

export const GET: RequestHandler = async ({ url, locals }) => {

    const listsIDS = url.searchParams.get("lists");

    if(listsIDS === null)
        return new Response("Wrong request", { status: 400 });

    const lists: Array<Prisma.scm_assembly_buylistGetPayload<{ include: { assembly: true, project: true }}>> = [];

    for(const list of listsIDS.split(","))
    {
        const listDocument = await locals.prisma.scm_assembly_buylist.findUnique({ where: { id: list }, include: { assembly: true, project: true }})

        if(listDocument === null)
            return new Response("Missing list data", { status: 404 });

        lists.push(listDocument);
    }

    const label = new LabelDocument(59, 102) as (jsPDF & LabelDocument);

    for(const [index, list] of lists.entries())
    {
        //get avatar from pocketbase and add it to the label
        //const url = locals.pb.getFileUrl(list.expand?.assembly, list.expand?.assembly.thumbnail);

        const response = await fetch(url);
        const blob = await response.arrayBuffer();

        label.addImage(new Uint8Array(blob), "PNG", 5, 5, 25, 25);

        await label.addQRCode(`list:${list.id}`, 5, 32.5, 25);

        label.printResizeText("Liste d'achat", 7, 50, 65, 15, { align: "center" });
        label.printResizeText(list.assembly.name, 8, 50, 65, 25, { align: "center" });

        label.printResizeText(list.name, 8, 50, 65, 42.5, { align: "center" });
        label.printResizeText(`Affaire: ${list.project?.name ?? "—"}`, 7, 50, 65, 50, { align: "center" });

        if(index + 1 < lists.length)
            label.addPage();        
    }

    const documentData = label.output();

    return new Response(documentData, { headers: { 
        "content-type": "application/pdf; charset=utf-8",
        "Content-Disposition": "inline; filename=labels.pdf"
    }});
}