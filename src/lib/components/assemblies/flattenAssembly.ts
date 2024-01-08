import type { Prisma } from "@prisma/client";
import { articleIncludeQuery } from "../article/article";

// TODO: test this
// TODO: find a way to track parent assemblies of articles
export async function flatAssembly(assemblyId: string, prisma: App.Locals["prisma"]): Promise<Array<scm_assembly_relation_with_article>>
{
    const articleRelations = await prisma.scm_assembly_relation_article.findMany({ where: { parent_id: assemblyId }, include: { article_child: { include: articleIncludeQuery }}});
    const subassembliesRelations = await prisma.scm_assembly_relation_sub_assembly.findMany({ where: { parent_id: assemblyId }});

    return [...articleRelations, (await Promise.all(subassembliesRelations.map(k => flatAssembly(k.assembly_child_id, prisma)))).flat()].flat();
}

export type scm_assembly_relation_with_article = Prisma.scm_assembly_relation_articleGetPayload<{
    include: {
        article_child: { include: typeof articleIncludeQuery }
    }
}>;