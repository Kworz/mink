import type { SCMArticle } from "@prisma/client";
import { redirect, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
    import: async ({ request, locals }) => {
        try
        {
            // TODO: Check this
            const form = await request.formData();
            const file = form.get("file");
            const columnOrder = form.get("columnOrder");

            if(!(file instanceof File))
                throw "article.import.file.missing";

            if(columnOrder === null)
                throw "article.import.columnOrder.missing";
    
            const fileContent = await file.text();
            const columns = JSON.parse(columnOrder.toString()) as (string | null)[];

            const lines = fileContent.split("\r\n").map(line => line.split(","));

            for(const line of lines)
            {
                const article = {
                    name: line[columns.indexOf("name")],
                    reference: line[columns.indexOf("reference")],
                    brand: line[columns.indexOf("manufacturer")],
                    
                } satisfies Partial<SCMArticle>;

                await locals.prisma.sCMArticle.create({ data: article });
            }
    
            throw redirect(303, "/app/scm/articles");
        }
        catch(ex)
        {
            console.log(ex);
            return { error: true }
        }
    }
}