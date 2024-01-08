<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import type { FilterCondition } from "$lib/components/filter/filter2";
    import Filter2 from "$lib/components/filter/Filter2.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";

    import type { ActionData, PageData, Snapshot } from "./$types";
    import Flex from "$lib/components/layout/flex.svelte";
    import Button from "$lib/components/Button.svelte";
    import RoundedLabel from "$lib/components/RoundedLabel.svelte";
    import TableFootCell from "$lib/components/table/TableFootCell.svelte";
    import Price from "$lib/components/formatters/Price.svelte";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    
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
        on:selectall={() => { selected = (allSelected) ? [] : data.flattenAssemblyReference.map(k => k.article.id)}}
        bind:allSelected
    >
        {#each data.flattenAssemblyReference as assemblyRow}

            <TableCell>
                <input type="checkbox" bind:group={selected} value={assemblyRow.article.id} />
            </TableCell>

            <TableCell>
                <ArticleRow article={assemblyRow.article} displayStock displayApprox />
            </TableCell>

            <TableCell>
                {@const itemsAdded = data.storeRelations.filter(r => r.article === assemblyRow.article.id).reduce((p, c) => p+c.quantity, 0)}
                {@const itemsTotal = assemblyRow.quantity * data.lists.length}
                <RoundedLabel role={(itemsAdded != itemsTotal ? (itemsAdded === 0) ? "danger" : "warning" : "success")} class="self-center">{`${itemsAdded} / ${itemsTotal}`}</RoundedLabel>
            </TableCell>

            {#each data.lists as list}
                {@const buyListRelation = data.storeRelations.find((r) => r.store === list.store && r.article === assemblyRow.article.id)}

                <TableCell position="center">
                    <form action="/app/scm/lists/grid/?/buyListRelationEdit" method="post" use:enhanceNoReset class="flex gap-4 items-center">

                        {#if form?.buyListRelationEdit?.[list.id]?.[assemblyRow.article.id]}
                            {@const data = form?.buyListRelationEdit?.[list.id]?.[assemblyRow.article.id]}

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

                        <input type="hidden" name="article" value={assemblyRow.article.id} />
                        <input type="hidden" name="list" value={list.id} />

                        <Flex items="center" gap={2}>
                            <FormInput 
                                name="quantity"
                                type="number" 
                                step={assemblyRow.article.unit === "" ? 1 : 0.1} 
                                value={buyListRelation?.quantity ?? 0}
                                min={0}
                                max={assemblyRow.quantity}
                                valid={buyListRelation?.quantity >= assemblyRow.quantity}
                                invalid={form?.buyListRelationEdit?.[list.id]?.[assemblyRow.article.id]?.error !== undefined}
                                label={form?.buyListRelationEdit?.[list.id]?.[assemblyRow.article.id]?.error ?? (form?.buyListRelationEdit?.[list.id]?.[assemblyRow.article.id]?.success ?? undefined)}
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

            <Price value={data.lists.reduce((pl, cl) => pl + data.flattenAssemblyReference.reduce((p, c) => p + ((c.article.expand?.["article_price(article)"]?.at(0)?.price ?? c.article?.price ?? 0) * (c.quantity - (data.storeRelations.find(r => r.article === c.article.id && r.store == cl.store)?.quantity ?? 0))), 0), 0)}/>
                /
            <Price value={data.flattenAssemblyReference.reduce((p, c) => p + ((c.article.expand?.["article_price(article)"]?.at(0)?.price ?? c.article?.price ?? 0)) * c.quantity, 0) * data.lists.length} />

        </TableFootCell>

        {#each data.lists as list}
            <TableFootCell>

                {@const buyListRelations = data.storeRelations.filter((r) => r.store === list.store)}

                <Price value={data.flattenAssemblyReference.reduce((p, c) => p + ((c.article.expand?.["article_price(article)"]?.at(0)?.price ?? c.article?.price ?? 0) * (c.quantity - (buyListRelations.find(r => r.article === c.article.id)?.quantity ?? 0))), 0)}/>
                /
                <Price value={data.flattenAssemblyReference.reduce((p, c) => p + ((c.article.expand?.["article_price(article)"]?.at(0)?.price ?? c.article?.price ?? 0)) * c.quantity, 0)} />

            </TableFootCell>
        {/each}

    </Table>
</Wrapper>