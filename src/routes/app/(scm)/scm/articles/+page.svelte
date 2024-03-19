<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import ArticleForm from "$lib/components/derived/article/ArticleForm.svelte";
    import ArticleRow from "$lib/components/derived/article/ArticleRow.svelte";
    import Filter2 from "$lib/components/derived/filter/Filter.svelte";
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
    import { ArrowDownTray, ArrowUpTray, PlusCircle, QrCode, Trash } from "@steeze-ui/heroicons";
    import type { ActionData, PageData } from "./$types";
    import EmptyData from "$lib/components/EmptyData.svelte";
    import { computeArticlePrice } from "$lib/components/derived/article/article";
    import { _ } from "svelte-i18n";
    import { browser } from "$app/environment";
    import Modal from "$lib/components/generics/modal/Modal.svelte";
    import TableCellCheckbox from "$lib/components/generics/table/TableCellCheckbox.svelte";

    export let data: PageData;
    export let form: ActionData;

    let filter = $page.url.searchParams.has("filter") ? JSON.parse(decodeURIComponent($page.url.searchParams.get("filter") as string)) : {};
    let sort = $page.url.searchParams.has("sort") ? JSON.parse(decodeURIComponent($page.url.searchParams.get("sort") as string)) : {};
    let tablePage = $page.url.searchParams.has("page") ? parseInt($page.url.searchParams.get("page") as string) : 0;
    let itemsPerPage = $page.url.searchParams.has("itemsPerPage") ? parseInt($page.url.searchParams.get("itemsPerPage") as string) : 50;
    
    let selected: Array<string> = [];

    let createArticle = false;
    let deleteArticles = false;
    let deleteArticleSuspense = false;

    const refresh = () => { if(browser) goto(`?filter=${encodeURIComponent(JSON.stringify(filter))}&sort=${encodeURIComponent(JSON.stringify(sort))}&page=${tablePage}&itemsPerPage=${itemsPerPage}`); }

    $: filter, sort, tablePage, itemsPerPage, refresh();

    $: if(form?.delete) { deleteArticleSuspense = false; }
    $: if(form?.delete !== undefined && "success" in form.delete) { deleteArticles = false; selected = []; }

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

{#if deleteArticles}
    <Modal title={$_('app.action.delete')} on:close={() => deleteArticles = false}>
        {#if form?.delete?.error !== undefined}
            <p>{$_(form.delete.error)}</p>
        {:else}
            <p>{$_('scm.article.delete_batch', { values: { n: selected.length }})}</p>
        {/if}

        <form class="flex flex-row gap-4" action="?/delete" slot="form" method="post" use:enhance on:submit={() => deleteArticleSuspense = true}>
            {#if form?.delete?.error !== undefined}
                <Button size="small" preventSend role="tertiary" click={() => deleteArticles = false}>{$_('app.generic.close')}</Button>
            {:else}
                <input type="hidden" value={selected.join(',')} name="articles" />
                <Button size="small" role="danger" suspense={deleteArticleSuspense}>{$_('app.action.delete')}</Button>
                <Button size="small" preventSend role="tertiary" click={() => deleteArticles = false}>{$_('app.generic.cancel')}</Button>
            {/if}
            
        </form>
    </Modal>
{/if}

<h1>{$_('app.generic.articles')}</h1>
<p>{$_('scm.articles.description')}</p>

<PillMenu message={selected.length > 0 ? $_('scm.articles.selected', { values: { n: selected.length }}) : undefined}>
    <PillMenuButton icon={PlusCircle} click={() => createArticle = true}>{$_('app.action.create_article')}</PillMenuButton>
    <PillMenuButton icon={ArrowDownTray} href="/app/scm/articles/import" role="secondary">{$_('scm.articles.action.import_articles')}</PillMenuButton>
    <PillMenuButton icon={ArrowUpTray} click={() => window.open(`/app/scm/articles/export/?articles=${selected.join(',')}`, '_blank')?.focus()} role="secondary">{$_('scm.articles.action.export_articles', { values: { n: selected.length }})}</PillMenuButton>
    {#if selected.length > 0}
        <PillMenuButton icon={QrCode} click={() => window.open(`/app/scm/articles/print/?articles=${selected.join(',')}`, '_blank')?.focus()}>{$_('scm.articles.action.print_label', { values: { n: selected.length }})}</PillMenuButton>
        <PillMenuButton icon={Trash} click={() => deleteArticles = true}>{$_('scm.article.actions.delete', { values: { n: selected.length }})}</PillMenuButton>
    {/if}
</PillMenu>

{#if data.articles.length > 0 || data.totalItems > 0}
    <Filter2 class="my-6" bind:filter availableFilters={[
        { name: "name", default: true, type: "string" },
        { name: "reference", type: "string" },
        { name: "brand", type: "string" },
        { name: "critical_quantity", type: "number" },
        { name: "consumable", type: "boolean" }]}
    />

    {#if $page.data.userSettings?.app_pages_top_of_table}
        <TablePages class="mb-6" totalPages={Math.floor(data.totalItems / itemsPerPage) + 1} bind:currentPage={tablePage} bind:itemsPerPage={itemsPerPage} />
    {/if}

    <Table headers={[
        "selectAll", 
        { label: `${$_('app.generic.article')} (${data.totalItems})`, colname: "name" }, 
        { label: $_('app.generic.consumable'), colname: "consumable" }, 
        { label: $_('app.generic.available_quantity') }, 
        { label: $_('app.generic.stores') }, 
        { label: $_('app.generic.sku'), colname: "reference" }, 
        { label: $_('app.generic.suppliers') }, 
        { label: $_('app.generic.brand'), colname: "brand" },    
        { label: $_('app.generic.wap_short') }, 
        { label: "Total prix stock"}]}
        selectables={data.articles.map(a => a.id)}
        bind:selected={selected}
        bind:sort={sort}
    >
        {#each data.articles as article (article.id)}

            {@const price = computeArticlePrice(article.order_rows)}
            {@const stockQuantity = article.store_relations.filter(sr => sr.store.assemblies_buylist === null).reduce((c, p) => p.quantity + c, 0)}

                <TableCellCheckbox bind:group={selected} value={article.id} />
                <TableCell>
                    <ArticleRow {article} displayPrice={false} displayManufacturer={false} displayInboundSupplies />
                </TableCell>
                <TableCell>
                    <RoundedLabel role={article.consumable ? "success" : "danger"}>{article.consumable ? $_('app.generic.yes') : $_('app.generic.no')}</RoundedLabel>
                </TableCell>
                <TableCell>
                    {#if article.critical_quantity}
                        <span
                            class:text-red-500={stockQuantity <= article.critical_quantity}
                            class:font-semibold={stockQuantity <= article.critical_quantity}
                        >
                            {$_(`app.generic.units_of_work_number.${article.unit}`, {values: { n: stockQuantity / (article.unit_quantity ?? 1), b: article.unit_quantity }})}
                        </span>         
                    {:else}               
                        {$_(`app.generic.units_of_work_number.${article.unit}`, {values: { n: stockQuantity / (article.unit_quantity ?? 1), b: article.unit_quantity }})}
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
                <TableCell><Price value={price * stockQuantity} /></TableCell>
        {/each}
    </Table>

    <TablePages totalPages={Math.floor(data.totalItems / itemsPerPage) + 1} bind:currentPage={tablePage} bind:itemsPerPage={itemsPerPage} />
{:else}
    <EmptyData on:click={() => createArticle = true } />
{/if}

