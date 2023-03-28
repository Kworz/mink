import type { RequestHandler } from "./$types";
import { Collections } from "$lib/DBTypes";

import { LabelDocument } from "$lib/label/labelDocument";
import type { AssembliesBuylistsResponseExpanded } from "../../lists/+page.server";

export const GET: RequestHandler = async ({ url, locals }) => {

    const listsIDS = url.searchParams.get("lists");

    if(listsIDS === null)
        return new Response("Wrong request", { status: 400 });

    const lists: Array<AssembliesBuylistsResponseExpanded> = [];

    for(const list of listsIDS.split(","))
    {
        lists.push(await locals.pb.collection(Collections.AssembliesBuylists).getOne<AssembliesBuylistsResponseExpanded>(list, { expand: "project,assembly"}))
    }

    const label = new LabelDocument(32, 57);

    for(const [index, list] of lists.entries())
    {
        await label.addQRCode(`list:${list.id}`, 2, 2, 18);

        label.printResizeText(list.expand?.project?.name, 6, 31, 38.5, 8, { align: "center" });
        label.printResizeText(list.expand?.assembly?.name, 6, 31, 38.5, 16, { align: "center" });

        label.printResizeText(list.name, 8, 51, 28.5, 28, { align: "center" });

        if(index + 1 < lists.length)
            label.addPage();        
    }

    const documentData = label.output();

    return new Response(documentData, { headers: { 
        "content-type": "application/pdf; charset=utf-8",
        "Content-Disposition": "inline; filename=labels.pdf"
    }});
}