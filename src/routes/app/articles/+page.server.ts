import { Collections, type ArticleResponse } from "$lib/DBTypes";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {

    const articles = await locals.pb.collection(Collections.Article).getFullList<ArticleResponse>();

    return {
        user: locals.user,
        articles: structuredClone(articles)
    };
}) satisfies PageServerLoad;