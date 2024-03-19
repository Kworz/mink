import { unit_of_work } from "$lib/prisma-enums";
import type { scm_article } from "@prisma/client";
import { fail, redirect, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
    import: async ({ request, locals }) => {

        const warnings = [];

        try
        {
            // TODO: Check this
            const form = await request.formData();
            const file = form.get("file");
            const columnOrder = form.get("column_order");

            const colSplitter = form.get("col_splitter")?.toString();
            const rowSplitter = form.get("row_splitter")?.toString();

            if(!(file instanceof File))
                return fail(400, { import: { error: "errors.article.import.missing_file" }});

            if(columnOrder === null)
                return fail(500, { import: { error: "errors.article.import.column_order_invalid" }});

            if(colSplitter === undefined || !([",", ";"].includes(colSplitter)))
                return fail(400, { import: { error : "errors.article.import.col_splitter_invalid" }});

            if(rowSplitter === undefined || !(["n", "rn"].includes(rowSplitter)))
                return fail(400, { import: { error: "errors.article.import.row_splitter_invalid" }});
    
            const fileContent = await file.text();
            const columns = JSON.parse(columnOrder.toString()) as (string | null)[];

            console.log(columns);

            const lineSplitter = rowSplitter === "rn" ? "\r\n" : "\n";

            const lines = fileContent.split(lineSplitter).map(line => line.split(colSplitter));

            for(const line of lines.slice(1))
            {

                const nonPhysicalValue = line[columns.indexOf("non_physical")];
                const consumableValue = line[columns.indexOf("consumable")];
                const internalValue = line[columns.indexOf("internal")];

                const article: Partial<scm_article> = {
                    name: line[columns.indexOf("name")],
                    reference: line[columns.indexOf("sku")],
                    brand: line[columns.indexOf("brand")],

                    order_quantity: Number(line[columns.indexOf("order_quantity")]) || undefined,
                    critical_quantity: Number(line[columns.indexOf("critical_quantity")]) || undefined,

                    non_physical: nonPhysicalValue === "true" || nonPhysicalValue === "1",
                    consumable: consumableValue === "true" || consumableValue === "1",
                    internal: internalValue === "true" || internalValue === "1",
                };

                // Parse article unit
                const articleUnit = line[columns.indexOf("unit_of_work")];
                if(articleUnit !== "")
                {
                    if(Object.keys(unit_of_work).includes(articleUnit))
                    {
                        article.unit = articleUnit as unit_of_work;
                        article.unit_quantity = Number(line[columns.indexOf("unit_of_work_quantity")]) || null;
                    }
                    else
                    {
                        warnings.push(`Found unit ${articleUnit} which is not compatible with ${Object.keys(unit_of_work).join(",")} for article ${article.reference}`);
                    }
                }

                if(article.brand === undefined || article.name === undefined || article.reference === undefined) // skip rows with missing data
                    continue;

                console.log("dry-run", article);

                await locals.prisma.scm_article.create({ data: article });
            }

            if(warnings.length > 0)
                return { import: { success: true, warnings }};
        }
        catch(ex)
        {
            console.log(ex);
            return { error: true }
        }

        return redirect(303, "/app/scm/articles");
    }
}