<script lang="ts">

    import { page } from "$app/stores";
    import { Collections, type AssembliesRelationsResponse, type AssembliesResponse } from "$lib/DBTypes";
    import type { ArticleResponseExpanded } from "../../../routes/app/articles/+page.server";
    import ArticleRow from "../article/ArticleRow.svelte";
    import Flex from "../layout/flex.svelte";
    import Table from "../table/Table.svelte";
    import TableCell from "../table/TableCell.svelte";
    import TableHead from "../table/TableHead.svelte";
    import TableRow from "../table/TableRow.svelte";
    import AssemblyPreview from "./AssemblyPreview.svelte";

    export let assembly: AssembliesResponse;

    type FlattenAssemblyRelations = {
        article: ArticleResponseExpanded;
        subAssemblies: Array<AssembliesResponse>;
        quantity: number;
    }

    const flattenAssembly = async (assembly: AssembliesResponse): Promise<Array<FlattenAssemblyRelations>> => {

        const flattenRelations: Array<FlattenAssemblyRelations> = [];

        async function subFlatten (assembly: AssembliesResponse, quantity: number = 1)
        {
            const relations = await $page.data.pb?.collection(Collections.AssembliesRelations).getFullList<AssembliesRelationsResponse>({ filter: `parent="${assembly.id}"`, expand: 'article_child.supplier' }) ?? [];

            for(const relation of relations)
            {
                if(relation.article_child !== '')
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
                else if(relation.assembly_child !== '')
                {
                    const subAssembly = await $page.data.pb?.collection(Collections.Assemblies).getOne<AssembliesResponse>(relation.assembly_child);

                    if(subAssembly !== undefined)
                        await subFlatten(subAssembly, relation.quantity);
                }
            }
            
        }

        await subFlatten(assembly);
        return flattenRelations;
    }

</script>

{#await flattenAssembly(assembly)}
    Chargement
{:then flattenAssemblyResult} 
    <Table>
        <svelte:fragment slot="head">
            <TableHead>Article ({flattenAssemblyResult.length})</TableHead>
            <TableHead>Assemblages</TableHead>
            <TableHead>Quantité totale</TableHead>
        </svelte:fragment>
    
        <svelte:fragment slot="body">
            {#each flattenAssemblyResult as far}
                <TableRow>
                    <TableCell><ArticleRow article={far.article} /></TableCell>
                    <TableCell>
                        <Flex direction="col" items="start">
                            {#each far.subAssemblies as assembly}
                                <AssemblyPreview {assembly} />
                            {/each}
                        </Flex>
                    </TableCell>
                    <TableCell>{far.quantity}</TableCell>
                </TableRow>
            {/each}
            
        </svelte:fragment>
    </Table>
{/await}