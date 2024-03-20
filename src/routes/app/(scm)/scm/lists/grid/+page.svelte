<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import { _ } from "svelte-i18n";
    import ArticleRow from "$lib/components/derived/article/ArticleRow.svelte";
    import DetailLabel from "$lib/components/generics/DetailLabel.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import Filter from "$lib/components/derived/filter/Filter.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import TableCellCheckbox from "$lib/components/generics/table/TableCellCheckbox.svelte";
    import { QrCode } from "@steeze-ui/heroicons";

    import type { PageData } from "./$types";
    import type { ActionData } from "../[id]/$types";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import Button from "$lib/components/generics/Button.svelte";
    import RoundedLabel from "$lib/components/generics/RoundedLabel.svelte";
    import TableFootCell from "$lib/components/generics/table/TableFootCell.svelte";
    import Price from "$lib/components/generics/formatters/Price.svelte";
    import { computeArticlePrice } from "$lib/components/derived/article/article";
    import { page } from "$app/stores";
    import { browser } from "$app/environment";
    import { enhanceApply } from "$lib/enhanceApply";
    
    export let data: PageData;
    export let form: ActionData;

    let filter = $page.url.searchParams.has("articleFilter") ? JSON.parse(decodeURIComponent($page.url.searchParams.get("articleFilter")!)) : {};
    let sort = $page.url.searchParams.has("articleSort") ? JSON.parse(decodeURIComponent($page.url.searchParams.get("articleSort")!)) : {};

    let selected: string[] = [];

    const refresh = () => { if(browser) { goto(`?ids=${data.lists.map(ld => ld.list.id).join(",")}&articleFilter=${encodeURIComponent(JSON.stringify(filter))}&articleSort=${encodeURIComponent(JSON.stringify(sort))}`) } }

    $: filter, sort, refresh();

    $: if(form?.buyListRelationEdit?.success) { invalidateAll(); setTimeout(() => { form = null; }, 3000); };

</script>

<svelte:head>
    <title>Grille de listes</title>
</svelte:head>

<h1>Grille de listes</h1>
<p>Nombre de listes: <DetailLabel>{data.lists.length}</DetailLabel>.</p>

<PillMenu message={selected.length > 0 ? $_('scm.articles.selected', { values: { n: selected.length }}) : undefined}>
    {#if selected.length > 0}
        <PillMenuButton icon={QrCode} click={() => window.open(`/app/scm/articles/print?images=true&lists=${selected.join(",")}`, '_blank')?.focus()}>Imprimer les etiquettes</PillMenuButton>
    {/if}
</PillMenu>

<Filter class="my-6" bind:filter availableFilters={[
    { name: "name", default: true, type: "string" },
    { name: "reference", type: "string" },
    { name: "brand", type: "string" },
    { name: "critical_quantity", type: "number" },
    { name: "consumable", type: "boolean" }]}
/>

<Table 
    headers={["selectAll", { label: `${$_('app.generic.article')} (${data.articles.length})` }, { label: $_('app.generic.total') }, ...data.lists.map(k => { return { label: k.list.name }})]}
    bind:selected
    selectables={data.articles.map(a => a.id)}
>
    {#each data.articles as article}
        <TableCellCheckbox bind:group={selected} value={article.id} />

        <TableCell><ArticleRow article={article} displayStock displayInboundSupplies /></TableCell>

        <TableCell>
            {@const itemsAdded = data.lists.flatMap(l => l.listStoreRelations).filter(r => r.article_id === article.id).reduce((p, c) => p + c.quantity, 0)}
            {@const articleRequiredQuantity = data.lists[0].flattenedAssembly[article.id].requiredQuantity}
            {@const itemsTotal = articleRequiredQuantity * data.lists.length}
            <RoundedLabel role={(itemsAdded != itemsTotal ? (itemsAdded === 0) ? "danger" : "warning" : "success")} class="self-center">{`${itemsAdded} / ${itemsTotal}`}</RoundedLabel>
        </TableCell>

        {#each data.lists as listData}

            {@const formData = form?.buyListRelationEdit?.article === article.id && form?.buyListRelationEdit?.list === listData.list.id ? form.buyListRelationEdit : undefined}

            {@const associatedStoreRelation = listData.listStoreRelations.find(lsr => lsr.article_id === article.id)}

            {@const storeQuantity = associatedStoreRelation?.quantity ?? 0}
            {@const requiredQuantity = listData.flattenedAssembly[article.id].requiredQuantity}

            {@const requiredPrice = (requiredQuantity - storeQuantity) * computeArticlePrice(article.order_rows)}
            {@const totalPrice = requiredQuantity * computeArticlePrice(article.order_rows)}
            {@const isValid = requiredQuantity <= storeQuantity}

            <TableCell position="center">
                <form action="/app/scm/lists/{listData.list.id}?/buyListRelationEdit" method="post" use:enhanceApply class="flex gap-4 items-center">

                    {#if formData}
                        {#if formData.storesToGetFrom !== undefined}
                            <FormInput type="select" name="store" label="Choisir un stock de provenance" required>
                                {#each formData.storesToGetFrom as store}
                                    <option value={store.id}>{store.name}</option>
                                {/each}
                            </FormInput>
                        {/if}

                        {#if formData.storesToSendTo !== undefined}
                            <FormInput type="select" name="store" label="Choisir un stock de destination">
                                {#each formData.storesToSendTo as store}
                                    <option value={store.id}>{store.name}</option>
                                {/each}
                            </FormInput>
                        {/if}
                    {/if}

                    <input type="hidden" name="article" value={article.id} />
                    <input type="hidden" name="list" value={listData.list.id} />

                    <Flex items="center" gap={2}>
                        <FormInput 
                            name="quantity"
                            type="number"
                            step={article.unit_quantity === null ? undefined : article.unit_quantity} 
                            value={associatedStoreRelation?.quantity ?? 0}
                            min={0}
                            max={requiredQuantity}
                            valid={associatedStoreRelation?.quantity === requiredQuantity}
                            invalid={formData?.error !== undefined}
                            label={formData?.error ?? formData?.success ?? undefined}
                            validateOnChange
                        />
                        /
                        <span class="font-medium">{requiredQuantity}</span>
                    </Flex>
                </form>
            </TableCell>
        {/each}
    {/each}

<!--
<TableFootCell />
    <TableFootCell>Total (Restant / Total)</TableFootCell>

    <TableFootCell>

        {@const articles = data.articles.}

        <Price value={data.lists.reduce((pl, cl) => pl + data.flattenAssemblyReference.reduce((p, c) => p + (computeArticlePrice(c.article_child.order_rows) * (c.quantity - (data.storeRelations.find(r => r.article_id === c.article_child_id && r.store_id == cl.store_id)?.quantity ?? 0))), 0), 0)}/>
            /
        <Price value={Object.keys(data.lists[0].flattenedAssembly).reduce((p, c) => p + (computeArticlePrice(data.articles.find(a => a.id === c)?.order_rows ?? [])) * data.lists[0].flattenedAssembly[c].requiredQuantity, 0) * data.lists.length} />

    </TableFootCell>

    {#each data.lists as list}
        <TableFootCell>

            {@const buyListRelations = data.storeRelations.filter((r) => r.store_id === list.store_id)}

            <Price value={data.flattenAssemblyReference.reduce((p, c) => p + (computeArticlePrice(c.article_child.order_rows) * (c.quantity - (buyListRelations.find(r => r.article_id === c.article_child_id)?.quantity ?? 0))), 0)}/>
            /
            <Price value={data.flattenAssemblyReference.reduce((p, c) => p + computeArticlePrice(c.article_child.order_rows) * c.quantity, 0)} />

        </TableFootCell>
    {/each}
-->
    

</Table>
