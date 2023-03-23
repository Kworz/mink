<script lang="ts">

    import { Collections, type AssembliesRelationsResponse, type AssembliesResponse } from "$lib/DBTypes";
    import { pocketbase } from "$lib/pocketbase";
    import type { ArticleResponseExpanded } from "../../../routes/app/articles/+page.server";
    import ArticleRow from "../article/ArticleRow.svelte";
    import Price from "../formatters/Price.svelte";
    import Flex from "../layout/flex.svelte";
    import Table from "../table/Table.svelte";
    import TableCell from "../table/TableCell.svelte";
    import TableHead from "../table/TableHead.svelte";
    import TableRow from "../table/TableRow.svelte";
    import Wrapper from "../Wrapper.svelte";
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
            const relations = await $pocketbase.collection(Collections.AssembliesRelations).getFullList<AssembliesRelationsResponse>({ filter: `parent="${assembly.id}"`, expand: 'article_child.supplier' }) ?? [];

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
                    const subAssembly = await $pocketbase?.collection(Collections.Assemblies).getOne<AssembliesResponse>(relation.assembly_child);

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
    <Wrapper class="mt-6">
        <h4>Chargement</h4>
    </Wrapper>
{:then flattenAssemblyResult} 
    <Table>
        <svelte:fragment slot="head">
            <TableHead>Article ({flattenAssemblyResult.length})</TableHead>
            <TableHead>Assemblages</TableHead>
            <TableHead>Quantité totale</TableHead>
            <TableHead>Prix</TableHead>
        </svelte:fragment>
    
        <svelte:fragment slot="body">
            {#each flattenAssemblyResult as far}
                <TableRow>
                    <TableCell><ArticleRow article={far.article} displayStock={true} displayApprox={true} /></TableCell>
                    <TableCell>
                        <Flex direction="col" items="start">
                            {#each far.subAssemblies as assembly}
                                <AssemblyPreview {assembly} />
                            {/each}
                        </Flex>
                    </TableCell>
                    <TableCell>{far.quantity}</TableCell>
                    <TableCell><Price value={far.quantity * (far.article.price ?? 0)} /></TableCell>
                </TableRow>
            {/each}
            
        </svelte:fragment>

        <svelte:fragment slot="foot">
            <TableRow>
                <TableCell colspan={3}>
                    Total prix
                </TableCell>
                <TableCell>
                    <Price value={flattenAssemblyResult.map(far => (far.article.price ?? 0) * far.quantity).reduce((p, c) => c = p + c, 0)} />
                </TableCell>
            </TableRow>
        </svelte:fragment>
    </Table>
{/await}