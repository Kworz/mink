import { Collections, type AssembliesRelationsResponse, type AssembliesResponse } from "$lib/DBTypes";
import type { ArticleResponseExpanded } from "../../../routes/app/articles/+page.server";
import type Client from "pocketbase";

type FlattenAssemblyRelations = {
    article: ArticleResponseExpanded;
    subAssemblies: Array<AssembliesResponse>;
    quantity: number;
};

type FlattenAssemblySubAssembliesRelations = {
    subAssembly: AssembliesResponse;
    quantity: number;
};

type AssembliesRelationsResponseExpanded = AssembliesRelationsResponse<{
    article_child: ArticleResponseExpanded;
}>;

type AssembliesRelationsResponseExpanded2 = AssembliesRelationsResponse<{
    article_child: ArticleResponseExpanded;
    assembly_child: AssembliesResponse;
}>;

export const flattenAssembly = async (assembly: AssembliesResponse, pocketbase: Client): Promise<Array<FlattenAssemblyRelations>> => {

    const flattenRelations: Array<FlattenAssemblyRelations> = [];

    async function subFlatten (assembly: AssembliesResponse, quantity = 1)
    {
        const relations = await pocketbase.collection(Collections.AssembliesRelations).getFullList<AssembliesRelationsResponseExpanded>({ filter: `parent="${assembly.id}"`, expand: 'article_child.supplier' }) ?? [];

        for(const relation of relations)
        {
            if(relation.article_child !== '' && relation.expand?.article_child !== undefined)
            {
                const flatRelation = flattenRelations.find(fr => fr.article.id === relation.article_child)
                if(flatRelation)
                {
                    flatRelation.quantity += (relation.quantity * quantity);
                    flatRelation.subAssemblies.push(assembly)
                }
                else
                {
                    flattenRelations.push({
                        article: relation.expand.article_child,
                        subAssemblies: [assembly],
                        quantity: (relation.quantity * quantity)
                    });
                }
            }
            else if(relation.assembly_child !== '' && relation.assembly_child !== undefined)
            {
                const subAssembly = await pocketbase.collection(Collections.Assemblies).getOne<AssembliesResponse>(relation.assembly_child);

                if(subAssembly !== undefined)
                    await subFlatten(subAssembly, relation.quantity);
            }
        }
        
    }

    await subFlatten(assembly);
    return flattenRelations.sort((a, b) => b.subAssemblies.length - a.subAssemblies.length);
}

export const flattenAssemblySubAssemblies = async (assembly: AssembliesResponse, pocketbase: Client): Promise<Array<FlattenAssemblySubAssembliesRelations>> => {
        
        const flattenRelationsSub: Array<FlattenAssemblySubAssembliesRelations> = [];

        async function subFlattenSubAssemblies (assembly: AssembliesResponse, quantity = 1)
        {
            const relations = await pocketbase.collection(Collections.AssembliesRelations).getFullList<AssembliesRelationsResponseExpanded2>({ filter: `parent="${assembly.id}"`, expand: 'article_child.supplier,assembly_child' }) ?? [];

            for(const relation of relations)
            {
                console.log(assembly, relation)
                if(relation.assembly_child !== '' && relation.expand?.assembly_child !== undefined)
                {
                    const flatRelation = flattenRelationsSub.find(fr => fr.subAssembly.id === relation.assembly_child)
                    if(flatRelation)
                    {
                        flatRelation.quantity += (relation.quantity * quantity);
                    }
                    else
                    {
                        flattenRelationsSub.push({
                            subAssembly: relation.expand.assembly_child,
                            quantity: (relation.quantity * quantity)
                        });
                    }

                    await subFlattenSubAssemblies(relation.expand?.assembly_child, relation.quantity * quantity);
                }
            }
            
        }
        flattenRelationsSub.push({
            subAssembly: assembly,
            quantity: 1
        });

        await subFlattenSubAssemblies(assembly);
        return flattenRelationsSub;
}