<script lang="ts">
    import { page } from "$app/stores";
    import type { AssembliesResponse } from "$lib/DBTypes";
    import { flattenAssembly, flattenAssemblySubAssemblies } from "./assemblyFlatener";

    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableFootCell from "$lib/components/table/TableFootCell.svelte";
    import FormInput from "../FormInput.svelte";
    import ArticleRow from "../article/ArticleRow.svelte";
    import Price from "../formatters/Price.svelte";
    import Flex from "../layout/flex.svelte";
    import AssemblyPreview from "./AssemblyPreview.svelte";

    export let assembly: AssembliesResponse;

    let flatMode: "assembly" | "article" = "article"; 

</script>

<FormInput type="select" name="" label="Mode" bind:value={flatMode} class="mb-6">
    <option value="article">Articles</option>
    <option value="assembly">Assemblage</option>
</FormInput>

{#if flatMode === "article"}
    {#await flattenAssembly(assembly, $page.data.pb)}
        <h4>Chargement</h4>
    {:then flattenAssemblyResult} 
        <Table headers={[{ label: "Article" }, { label: "Assemblages" }, { label: "Quantité totale" }, { label: "Prix" }]}>
        
            {#each flattenAssemblyResult as far}
                <TableCell><ArticleRow article={far.article} displayStock displayApprox /></TableCell>
                <TableCell>
                    <Flex direction={far.subAssemblies.length > 1 ? "row" : "col"} items="start">
                        {#each far.subAssemblies as assembly}
                            <AssemblyPreview {assembly} minimized={far.subAssemblies.length > 1} />
                        {/each}
                    </Flex>
                </TableCell>
                <TableCell>{far.quantity}</TableCell>
                <TableCell><Price value={far.quantity * (far.article.expand?.["article_price(article)"]?.at(0)?.price ?? far.article.price ?? 0)} /></TableCell>
            {/each}

            <TableFootCell colspan={3}>
                Total prix
            </TableFootCell>
            <TableFootCell>
                <Price value={flattenAssemblyResult.map(far => (far.article.expand?.["article_price(article)"]?.at(0)?.price ?? far.article.price ?? 0) * far.quantity).reduce((p, c) => c = p + c, 0)} />
            </TableFootCell>
        </Table>
    {/await}
{:else}
    {#await flattenAssemblySubAssemblies(assembly, $page.data.pb)}
        <h4>Chargement</h4>
    {:then flattenAssemblySubAssembliesResult} 
        <Table headers={[{ label: "Assemblage" }, { label: "Quantité totale" }, { label: "Durée d'assemblage" }]}>

            {#each flattenAssemblySubAssembliesResult as far}
                <TableCell><AssemblyPreview assembly={far.subAssembly} imageSize="h-20" /></TableCell>
                <TableCell>{far.quantity}</TableCell>
                <TableCell>{(far.quantity * (far.subAssembly.assembly_time ?? 0) )|| "—"} Heures</TableCell>
            {/each}

            <TableFootCell colspan={2}>
                Total
            </TableFootCell>
            <TableFootCell>
                {flattenAssemblySubAssembliesResult.map(far => (far.subAssembly.assembly_time ?? 0) * far.quantity).reduce((p, c) => c = p + c, 0)} Heures
            </TableFootCell>
        </Table>
    {/await}
{/if}