import { Collections, type ArticleMovementsRecord } from "$lib/DBTypes";
import { ClientResponseError } from "pocketbase";
import { flattenAssembly } from "$lib/components/assemblies/assemblyFlatener";
import type { PageServerLoad, Actions } from "./$types";

export const load = (async ({ locals, params }) => {

    const list = await locals.pb.collection(Collections.AssembliesBuylists).getOne(params.id, { expand: "assembly,project"});
    const listItems = await locals.pb.collection(Collections.AssembliesBuylistsRows).getFullList({ filter: `buylist = "${list.id}"`});
    const flattenAssemblyResult = await flattenAssembly(list.expand.assembly, locals.pb);

    return {
        list: structuredClone(list),
        listItems: structuredClone(listItems), 
        flattenAssemblyResult: structuredClone(flattenAssemblyResult)
    }

}) satisfies PageServerLoad;

export const actions: Actions = {

    buyListRelationEdit: async ({ locals, request, params }) => {

        const form = await request.formData();
        const list = await locals.pb.collection(Collections.AssembliesBuylists).getOne(params.id);

        try
        {
            const articleID = form.get("article")?.toString();
            const quantity = Number(form.get("quantity")?.toString());
            const buylist = form.get("buylist")?.toString();

            if(articleID === undefined || quantity === undefined || buylist === undefined)
                throw "Invalid form data";

            const article = await locals.pb.collection(Collections.Article).getOne(articleID);

            if(article.quantity < quantity)
                throw "Buy list affectation quantity is higher than article quantity";

            const buyListRelation = await locals.pb.collection(Collections.AssembliesBuylistsRows).getFirstListItem(`article = "${articleID}" && buylist = "${buylist}"`);

            const articleMovement: ArticleMovementsRecord = {
                article: articleID,
                quantity_update: -(quantity - buyListRelation.quantity),
                user: locals.user?.id,
                reason: `${(quantity - buyListRelation.quantity) < 0 ? "Retour de " : "Affectation à"} ${list.name}`
            };

            await locals.pb.collection(Collections.AssembliesBuylistsRows).update(buyListRelation.id, { quantity: quantity });
            await locals.pb.collection(Collections.Article).update(articleID, { "quantity-": (quantity - buyListRelation.quantity)})
            await locals.pb.collection(Collections.ArticleMovements).create(articleMovement);
        }
        catch(ex)
        {
            if(ex instanceof ClientResponseError)
            {
                try
                {
                    const articleID = form.get("article")?.toString();
                    const quantity = Number(form.get("quantity")?.toString());
                    const buylist = form.get("buylist")?.toString();

                    if(articleID === undefined || quantity === undefined || buylist === undefined)
                        throw "Invalid form data";
                    
                    const article = await locals.pb.collection(Collections.Article).getOne(articleID);

                    if(article.quantity < quantity)
                        throw "Buy list affectation quantity is higher than article quantity";

                    const articleMovement: ArticleMovementsRecord = {
                        article: articleID,
                        quantity_update: -quantity,
                        user: locals.user?.id,
                        reason: `Affectation à ${list.name}`
                    };

                    await locals.pb.collection(Collections.AssembliesBuylistsRows).create({ article: form.get("article"), buylist: form.get("buylist"), quantity: form.get("quantity") });
                    await locals.pb.collection(Collections.ArticleMovements).create(articleMovement);
                    await locals.pb.collection(Collections.Article).update(articleID, { "quantity-": quantity });
                }
                catch(ex)
                {
                    return { buyListRelationEdit: { error: (ex instanceof ClientResponseError) ? ex.message : ex }}
                }
            }
            else
                return { buyListRelationEdit: { [`${form.get("article")?.toString() ?? "all"}`]: { error: ex }}}

        }
        return { buyListRelationEdit: { success: "Successfully Created/updated row row" }};
    }
};