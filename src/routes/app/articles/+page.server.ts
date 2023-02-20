import { Collections, type ArticleResponse } from "$lib/DBTypes";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, url }) => {

    const sort = url.searchParams.get("sort") ?? "name";

    const articles = await locals.pb.collection(Collections.Article).getFullList<ArticleResponse>(undefined, { sort });

    return {
        user: locals.user,
        articles: structuredClone(articles)
    };
}) satisfies PageServerLoad;