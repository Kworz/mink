import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {

    const articles = await locals.pb.collection("article").getFullList();

    return {
        user: locals.user,
        articles: structuredClone(articles)
    };
}) satisfies PageServerLoad;