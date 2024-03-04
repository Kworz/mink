import { articleIncludeQuery } from "$lib/components/derived/article/article";

type flatAssemblyRelationMap = {
    [key: string]: {
        requiredQuantity: number,
        parentAssemblies: Set<string>
    }
}

/**
 * This function flatten assemblies
 * @param assemblyId assembly ID you want to flatten
 * @param prisma prisma client object
 * @param assemblyQuantity initial assembly count you want, mainly used for recusion
 * @param relations base relations, mainly used for recursion
 * @returns assembly relations flatten out
 */
export async function flattenAssembly(assemblyId: string, prisma: App.Locals["prisma"], assemblyQuantity = 1, relations: flatAssemblyRelationMap = {}): Promise<flatAssemblyRelationMap> {

    const articleRelations = await prisma.scm_assembly_relation_article.findMany({ where: { parent_id: assemblyId }, include: { article_child: { include: articleIncludeQuery }}});

    // loop trought articles and flat their parent relations out
    for(const articleRelation of articleRelations)
    {
        if(relations[articleRelation.article_child_id] === undefined)
            relations[articleRelation.article_child_id] = { requiredQuantity: (articleRelation.quantity * assemblyQuantity), parentAssemblies: new Set([assemblyId]) };
        else
        {
            relations[articleRelation.article_child_id].requiredQuantity += (articleRelation.quantity * assemblyQuantity);
            relations[articleRelation.article_child_id].parentAssemblies.add(assemblyId);
        }
    }

    const subassembliesRelations = await prisma.scm_assembly_relation_sub_assembly.findMany({ where: { parent_id: assemblyId }});

    // Loop trough subassemblies and flatten them
    for(const subAssemblyRelation of subassembliesRelations)
    {
        relations = await flattenAssembly(subAssemblyRelation.assembly_child_id, prisma, subAssemblyRelation.quantity * assemblyQuantity, relations);
    }

    return relations;
}