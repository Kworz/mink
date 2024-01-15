<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import ArticleForm from "$lib/components/derived/article/ArticleForm.svelte";
    import ArticleRow from "$lib/components/derived/article/ArticleRow.svelte";
    import { returnArticleUnit } from "$lib/components/derived/article/artictleUnits";
    import Filter2 from "$lib/components/derived/filter/Filter2.svelte";
    import type { FilterCondition } from "$lib/components/derived/filter/filter2";
    import Store from "$lib/components/derived/store/Store.svelte";
    import Supplier from "$lib/components/derived/supplier/Supplier.svelte";
    import Button from "$lib/components/generics/Button.svelte";
    import RoundedLabel from "$lib/components/generics/RoundedLabel.svelte";
    import Price from "$lib/components/generics/formatters/Price.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import MenuSide from "$lib/components/generics/menu/MenuSide.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import TablePages from "$lib/components/generics/table/TablePages.svelte";
    import { ArrowDownTray, ArrowUpTray, PlusCircle, QrCode } from "@steeze-ui/heroicons";
    import type { PageData, Snapshot } from "./$types";
    import EmptyData from "$lib/components/EmptyData.svelte";
    import { computeArticlePrice } from "$lib/components/derived/article/article";
    import { _ } from "svelte-i18n";

    export let data: PageData;

    let createArticle = false;

    let filters: Array<FilterCondition> = [];
    let selected: Array<string> = [];

    export const snapshot: Snapshot<Array<FilterCondition>> = {
        capture: () => filters,
        restore: (value) => filters = value
    };

    const editQueryParams = (query: { filter?: string, sort?: string, page?: number }) => {

        const params = new URLSearchParams();

        //params.set("filter", query.filter ?? data.filter);
        params.set("sort", query.sort ?? data.sort);
        params.set("page", query.page?.toString() ?? data.page.toString());

        goto(`?${params.toString()}`, { noScroll: true });
    }

</script>

<svelte:head>
    <title>{$_('app.generic.articles')} - mink</title>
</svelte:head>

{#if createArticle}
    <MenuSide title={$_('app.action.create_article')} on:close={() => createArticle = false}>
        <form action="?/create" method="POST" use:enhance>
            <ArticleForm />
            <div class="flex flex-row gap-6 mt-4">
                <Button size="small">{$_('app.action.create')}</Button>
                <Button size="small" preventSend role="tertiary" click={() => createArticle = false}>{$_('app.generic.cancel')}</Button>
            </div>
        </form>
    </MenuSide>
{/if}

<h1>{$_('app.generic.articles')}</h1>
<p>{$_('scm.articles.description')}</p>

<PillMenu message={selected.length > 0 ? $_('scm.articles.selected', { values: { n: selected.length }}) : undefined}>
    <PillMenuButton icon={PlusCircle} click={() => createArticle = true}>{$_('app.action.create_article')}</PillMenuButton>
    <PillMenuButton icon={ArrowDownTray} href="/app/scm/articles/import" role="secondary">{$_('scm.articles.action.import_articles')}</PillMenuButton>
    <PillMenuButton icon={ArrowUpTray} click={() => window.open(`/app/scm/articles/export/?articles=${selected.join(',')}`, '_blank')?.focus()} role="secondary">{$_('scm.articles.action.export_articles', { values: { n: selected.length }})}</PillMenuButton>
    {#if selected.length > 0}
        <PillMenuButton icon={QrCode} click={() => window.open(`/app/scm/articles/print/?articles=${selected.join(',')}`, '_blank')?.focus()}>{$_('scm.articles.action.print_label', { values: { n: selected.length }})}</PillMenuButton>
    {/if}
</PillMenu>

{#if data.articles.length > 0}
    <Filter2 class="my-6" bind:filters availableFilters={[
        { name: "name", default: true, type: "string" },
        { name: "reference", type: "string" },
        { name: "manufacturer", type: "string" },
        { name: "critical_quantity", type: "number"},
        { name: "consumable", type: "boolean" }]}
        on:filter={(e) => editQueryParams({ filter: e.detail })}
    />

    <Table headers={[
        "selectAll", 
        { label: `${$_('app.generic.article')} (${data.totalItems})`, colname: "name" }, 
        { label: $_('app.generic.consumable') }, 
        { label: $_('app.generic.available_quantity') }, 
        { label: $_('app.generic.stores') }, 
        { label: $_('app.generic.sku') }, 
        { label: $_('app.generic.suppliers') }, 
        { label: $_('app.generic.brand') },    
        { label: $_('app.generic.wap_short') }, 
        { label: "Total prix stock"}]}
        selectables={data.articles.map(a => a.id)}
        bind:selected={selected}
        bind:sort={data.sort}
        on:sort={(e) => editQueryParams({ sort: e.detail })}
    >
        {#each data.articles as article (article.id)}

            {@const price = computeArticlePrice(article.order_rows)}
            {@const stock_quantity = article.store_relations.filter(sr => !sr.store.temporary).reduce((c, p) => p.quantity + c, 0)}

                <TableCell class="items-center"><input type="checkbox" bind:group={selected} value={article.id} /></TableCell>
                <TableCell>
                    <ArticleRow {article} displayPrice={false} displayManufacturer={false} displayInboundSupplies />
                </TableCell>
                <TableCell>
                    <RoundedLabel role={article.consumable ? "success" : "danger"}>{article.consumable ? $_('app.generic.yes') : $_('app.generic.no')}</RoundedLabel>
                </TableCell>
                <TableCell>
                    {#if article.critical_quantity}
                        <span
                            class:text-red-500={stock_quantity <= article.critical_quantity}
                            class:font-semibold={stock_quantity <= article.critical_quantity}
                        >
                            {returnArticleUnit(article.unit, article.unit_quantity, stock_quantity)}
                        </span>         
                    {:else}               
                        {returnArticleUnit(article.unit, article.unit_quantity, stock_quantity)}
                    {/if}
                </TableCell>
                <TableCell>
                    {#each article.store_relations.reduce((c, p) => [...c, p.store], new Array()) as store}
                        <Store {store} />
                    {/each}
                </TableCell>
                <TableCell>{article.reference}</TableCell>
                <TableCell>
                    <Flex gap={2} direction="row" wrap="wrap">
                        {@const suppliers = article.order_rows.map(or => or.order.supplier).reduce((c, p) => c.find(s => s.id === p.id) ? c : [...c, p], new Array())}
                        {#each suppliers as supplier}
                            <Supplier {supplier} />
                        {:else}
                            <span class="text-sm text-zinc-200">{$_('app.generic.suppliers_null')}</span>
                        {/each}
                    </Flex>
                </TableCell>
                <TableCell>{(article.internal) ? $page.data.appSettings.company_name : article.brand}</TableCell>
                
                <TableCell><Price value={price} /></TableCell>
                <TableCell><Price value={price * stock_quantity} /></TableCell>
        {/each}
    </Table>

    <TablePages totalPages={Math.floor(data.totalItems / 50) + 1} bind:currentPage={data.page} on:change={(e) => editQueryParams({ page: e.detail })} />
{:else}
    <EmptyData on:click={() => createArticle = true } />
{/if}

