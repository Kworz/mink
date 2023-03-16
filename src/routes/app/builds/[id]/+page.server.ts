import { Collections, type BuildResponse, type BuildRowResponse } from "$lib/DBTypes";
import type { NomenclatureResponseExpanded } from "../../../../../../../../../Users/romainsapet/METALIZZ/nomenclaturize2/.svelte-kit/types/src/routes/app/nomenclatures/[id]/proxy+page.server";
import type { NomenclatureRowResponseExpandedWithArticle } from "../../../../../../../../../Users/romainsapet/METALIZZ/nomenclaturize2/src/routes/app/nomenclatures/[id]/+page.server";
import type { PageServerLoad } from "./$types";

export type BuildResponseExpanded = BuildResponse<{
    "build_row(build)": BuildRowResponse<{
        parent_nomenclature_row: NomenclatureRowResponseExpandedWithArticle
    }>
}>

export const load = (async ({ params, locals }) => {

    const build = await locals.pb.collection(Collections. Build).getOne<BuildResponseExpanded>(params.id, { expand: "build_row(build).parent_nomenclature_row.child_article" });

    const nomenclature =  await locals.pb.collection(Collections.Nomenclature).getOne<NomenclatureResponseExpanded>(build.parent_nomenclature, {
        expand: `nomenclature_row(parent_nomenclature).child_article`,
    });

    return {
        build: structuredClone(build),
        nomenclature: structuredClone(nomenclature)
    };

}) satisfies PageServerLoad;