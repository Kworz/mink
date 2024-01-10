<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import ArticleRow from "$lib/components/derived/article/ArticleRow.svelte";
    import DetailLabel from "$lib/components/generics/DetailLabel.svelte";
    import type { FilterCondition } from "$lib/components/derived/filter/filter2";
    import Filter2 from "$lib/components/derived/filter/Filter2.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import Wrapper from "$lib/components/generics/containers/Wrapper.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";

    import type { ActionData, PageData, Snapshot } from "./$types";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import Button from "$lib/components/generics/Button.svelte";
    import RoundedLabel from "$lib/components/generics/RoundedLabel.svelte";
    import TableFootCell from "$lib/components/generics/table/TableFootCell.svelte";
    import Price from "$lib/components/generics/formatters/Price.svelte";
    import { computeArticlePrice } from "$lib/components/derived/article/article";
    
    export let data: PageData;
    export let form: ActionData;

    let filters: Array<FilterCondition> = [];
    let filter: string = "";

    let selected: string[] = [];

    $: if(form !== null && form.buyListRelationEdit?.success) { filter = ""; invalidateAll(); setTimeout(() => { form = null; }, 2500) };

    export const snapshot: Snapshot<FilterCondition[]> = {
        capture: () => filters,
        restore: (value) => { filters = value; }
    }

    $: allSelected = selected.length === data.flattenAssemblyReference.length;

</script>

<svelte:head>
    <title>Grille de listes</title>
</svelte:head>

<Wrapper>
    <h3 class="mb-3">Grille de listes</h3>
    <p>Nombre de listes: <DetailLabel>{data.lists.length}</DetailLabel>.</p>
</Wrapper>

<Wrapper class="mt-6">

    {#if selected.length > 0}
        <a href="/app/scm/articles/print?images=true&articles={selected.join(",")}" class="mb-6"><Button size="small">Imprimer les etiquettes</Button></a>
    {/if}

    <Filter2 bind:filter bind:filters availableFilters={[{name: "article.name", default: true, type: "string" }, { name: "quantity", type: "number" }, { name: "manufacturer", type: "string" }, { name: "reference", type: "string" }, { name: "supplier.name", type: "array" }, { name: "valid", type: "boolean" }, { name: "stock", type: "boolean" }]} />
    
    <Table 
        headers={["selectAll", { label: "Article"}, { label: "Total" }, ...data.lists.map(k => { return { label: k.name }})]}
        class="mt-6"
        on:selectall={() => { selected = (allSelected) ? [] : data.flattenAssemblyReference.map(far => far.article_child_id)}}
        bind:allSelected
    >
        {#each data.flattenAssemblyReference as assemblyRow}

            <TableCell>
                <input type="checkbox" bind:group={selected} value={assemblyRow.article_child_id} />
            </TableCell>

            <TableCell>
                <ArticleRow article={assemblyRow.article_child} displayStock displayApprox />
            </TableCell>

            <TableCell>
                {@const itemsAdded = data.storeRelations.filter(r => r.article_id === assemblyRow.article_child_id).reduce((p, c) => p + c.quantity, 0)}
                {@const itemsTotal = assemblyRow.quantity * data.lists.length}
                <RoundedLabel role={(itemsAdded != itemsTotal ? (itemsAdded === 0) ? "danger" : "warning" : "success")} class="self-center">{`${itemsAdded} / ${itemsTotal}`}</RoundedLabel>
            </TableCell>

            {#each data.lists as list}
                {@const buyListRelation = data.storeRelations.find((r) => r.store_id === list.store_id && r.article_id === assemblyRow.article_child_id)}

                <TableCell position="center">
                    <form action="/app/scm/lists/grid/?/buyListRelationEdit" method="post" use:enhanceNoReset class="flex gap-4 items-center">

                        {#if form?.buyListRelationEdit?.[list.id]?.[assemblyRow.article_child_id]}
                            {@const data = form?.buyListRelationEdit?.[list.id]?.[assemblyRow.article_child_id]}

                            {#if data.storesToGetFrom !== undefined}
                                <FormInput type="select" name="store" label="Choisir un stock de provenance" labelMandatory>
                                    {#each data.storesToGetFrom as store}
                                        <option value={store.id}>{store.name}</option>
                                    {/each}
                                </FormInput>
                            {/if}

                            {#if data.storesToSendTo !== undefined}
                                <FormInput type="select" name="store" label="Choisir un stock de destination">
                                    {#each data.storesToSendTo as store}
                                        <option value={store.id}>{store.name}</option>
                                    {/each}
                                </FormInput>
                            {/if}
                        {/if}

                        <input type="hidden" name="article" value={assemblyRow.article_child_id} />
                        <input type="hidden" name="list" value={list.id} />

                        <Flex items="center" gap={2}>
                            <FormInput 
                                name="quantity"
                                type="number" 
                                step={assemblyRow.article_child.unit === "" ? 1 : 0.1} 
                                value={buyListRelation?.quantity ?? 0}
                                min={0}
                                max={assemblyRow.quantity}
                                valid={buyListRelation?.quantity >= assemblyRow.quantity}
                                invalid={form?.buyListRelationEdit?.[list.id]?.[assemblyRow.article_child_id]?.error !== undefined}
                                label={form?.buyListRelationEdit?.[list.id]?.[assemblyRow.article_child_id]?.error ?? (form?.buyListRelationEdit?.[list.id]?.[assemblyRow.article_child_id]?.success ?? undefined)}
                                validateOnChange
                            />
                            /
                            <span class="font-medium">{assemblyRow.quantity}</span>
                        </Flex>
                    </form>
                </TableCell>
            {/each}
        {/each}

        <TableFootCell />
        <TableFootCell>Total (Restant / Total)</TableFootCell>

        <TableFootCell>

            <Price value={data.lists.reduce((pl, cl) => pl + data.flattenAssemblyReference.reduce((p, c) => p + (computeArticlePrice(c.article_child.order_rows) * (c.quantity - (data.storeRelations.find(r => r.article_id === c.article_child_id && r.store_id == cl.store_id)?.quantity ?? 0))), 0), 0)}/>
                /
            <Price value={data.flattenAssemblyReference.reduce((p, c) => p + (computeArticlePrice(c.article_child.order_rows)) * c.quantity, 0) * data.lists.length} />

        </TableFootCell>

        {#each data.lists as list}
            <TableFootCell>

                {@const buyListRelations = data.storeRelations.filter((r) => r.store_id === list.store_id)}

                <Price value={data.flattenAssemblyReference.reduce((p, c) => p + (computeArticlePrice(c.article_child.order_rows) * (c.quantity - (buyListRelations.find(r => r.article_id === c.article_child_id)?.quantity ?? 0))), 0)}/>
                /
                <Price value={data.flattenAssemblyReference.reduce((p, c) => p + computeArticlePrice(c.article_child.order_rows) * c.quantity, 0)} />

            </TableFootCell>
        {/each}

    </Table>
</Wrapper>