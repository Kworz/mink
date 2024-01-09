import { articleIncludeQuery } from "$lib/components/derived/article/article";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, params, url }) => {

    const sort = url.searchParams.get("sort") ?? "article.name";
    const filter = url.searchParams.get("filter") ?? "";
    const page = Number(url.searchParams.get("page")) ?? 1;

    const store = await locals.prisma.scm_store.findUniqueOrThrow({ where: { id: params.id }, include: { store_relations: { include: { article: { include: articleIncludeQuery }}, skip: page * 50, take: 50 }}});

    return { store };

}) satisfies PageServerLoad;