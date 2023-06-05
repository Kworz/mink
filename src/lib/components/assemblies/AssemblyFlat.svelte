<script lang="ts">
    import type { AssembliesResponse } from "$lib/DBTypes";
    import { page } from "$app/stores";
    import { flattenAssembly, flattenAssemblySubAssemblies } from "./assemblyFlatener";

    import ArticleRow from "../article/ArticleRow.svelte";
    import Price from "../formatters/Price.svelte";
    import FormInput from "../FormInput.svelte";
    import Flex from "../layout/flex.svelte";
    import Table from "../table/Table.svelte";
    import TableCell from "../table/TableCell.svelte";
    import TableHead from "../table/TableHead.svelte";
    import TableRow from "../table/TableRow.svelte";
    import Wrapper from "../Wrapper.svelte";
    import AssemblyPreview from "./AssemblyPreview.svelte";

    export let assembly: AssembliesResponse;

    let flatMode: "assembly" | "article" = "article"; 

</script>

<Wrapper class="mt-6">

    <Flex>
        <FormInput type="select" name="" label="Mode" bind:value={flatMode}>
            <option value="article">Articles</option>
            <option value="assembly">Assemblage</option>
        </FormInput>
    </Flex>

    {#if flatMode === "article"}
    
        {#await flattenAssembly(assembly, $page.data.pb)}
            <h4>Chargement</h4>
        {:then flattenAssemblyResult} 
            <Table embeded={true}>
                <svelte:fragment slot="head">
                    <TableHead>Article ({flattenAssemblyResult.length})</TableHead>
                    <TableHead>Assemblages</TableHead>
                    <TableHead>Quantité totale</TableHead>
                    <TableHead>Prix</TableHead>
                </svelte:fragment>
            
                <svelte:fragment slot="body">
                    {#each flattenAssemblyResult as far}
                        <TableRow>
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
                        </TableRow>
                    {/each}
                    
                </svelte:fragment>
    
                <svelte:fragment slot="foot">
                    <TableRow>
                        <TableCell colspan={3}>
                            Total prix
                        </TableCell>
                        <TableCell>
                            <Price value={flattenAssemblyResult.map(far => (far.article.expand?.["article_price(article)"]?.at(0)?.price ?? far.article.price ?? 0) * far.quantity).reduce((p, c) => c = p + c, 0)} />
                        </TableCell>
                    </TableRow>
                </svelte:fragment>
            </Table>
        {/await}
    
    {:else}
    
        {#await flattenAssemblySubAssemblies(assembly, $page.data.pb)}
            <h4>Chargement</h4>
        {:then flattenAssemblySubAssembliesResult} 
            <Table embeded={true}>
                <svelte:fragment slot="head">
                    <TableHead>Assemblages ({flattenAssemblySubAssembliesResult.length})</TableHead>
                    <TableHead>Quantité totale</TableHead>
                    <TableHead>Durée d'assemblage</TableHead>
                </svelte:fragment>
            
                <svelte:fragment slot="body">
                    {#each flattenAssemblySubAssembliesResult as far}
                        <TableRow>
                            <TableCell><AssemblyPreview assembly={far.subAssembly} imageSize="h-20" /></TableCell>
                            <TableCell>{far.quantity}</TableCell>
                            <TableCell>{(far.quantity * (far.subAssembly.assembly_time ?? 0) )|| "—"} Heures</TableCell>
                        </TableRow>
                    {/each}
                    
                </svelte:fragment>
    
                <svelte:fragment slot="foot">
                    <TableRow>
                        <TableCell colspan={2}>
                            Total
                        </TableCell>
                        <TableCell>
                            {flattenAssemblySubAssembliesResult.map(far => (far.subAssembly.assembly_time ?? 0) * far.quantity).reduce((p, c) => c = p + c, 0)} Heures
                        </TableCell>
                    </TableRow>
                </svelte:fragment>
            </Table>
        {/await}
    
    {/if}

</Wrapper>
