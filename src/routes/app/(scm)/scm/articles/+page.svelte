<script lang="ts">
    import { goto } from "$app/navigation";
    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Supplier from "$lib/components/supplier/Supplier.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableTitle from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";

    import { page } from "$app/stores";

    import type { PageData, Snapshot } from "./$types";
    import { browser } from "$app/environment";
    import Filter2 from "$lib/components/filter/Filter2.svelte";
    import type { FilterCondition } from "$lib/components/filter/filter2";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import TablePages from "$lib/components/table/TablePages.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import { ArrowDownTray, ArrowUpTray, PlusCircle, QrCode } from "@steeze-ui/heroicons";
    import Store from "$lib/components/store/Store.svelte";
    import Price from "$lib/components/formatters/Price.svelte";
    import { returnArticleUnit } from "$lib/components/article/artictleUnits";
    import { env } from "$env/dynamic/public";
    import RoundedLabel from "$lib/components/RoundedLabel.svelte";
    export let data: PageData;

    let filters: Array<FilterCondition> = [];
    let filter: string = $page.url.searchParams.get("filter") ?? "";

    let selected: Array<string> = [];

    let activeSort = $page.url.searchParams.get("sort") ?? "name";
    let itemsPage = Number($page.url.searchParams.get("page")) ?? 1;

    export const snapshot: Snapshot<Array<FilterCondition>> = {
        capture: () => filters,
        restore: (value) => filters = value
    }

    const triggerRefresh = () => {
        if(browser) {
            goto(`/app/scm/articles?sort=${activeSort}&page=${itemsPage}&filter=${filter}`, { noScroll: true });
            selected = [];
        }
    }

    $: filter, activeSort, itemsPage, triggerRefresh();  
    $: selectedAll = data.articles.length === selected.length;

</script>

<svelte:head>
    <title>Nomenclaturize — Articles</title>
</svelte:head>

<Wrapper class="mb-6">

    <h2>Articles</h2>
    <p>Liste des articles disponible dans la base.</p>

</Wrapper>

<Wrapper class="relative">
    
    <PillMenu>
        <PillMenuButton icon={PlusCircle} href="/app/scm/articles/new">Créer un article</PillMenuButton>
        <PillMenuButton icon={ArrowDownTray} href="/app/scm/articles/import" role="secondary">Importer des articles</PillMenuButton>
        <PillMenuButton icon={ArrowUpTray} click={() => window.open(`/app/scm/articles/export/`, '_blank')?.focus()} role="secondary">Exporter les articles</PillMenuButton>
        {#if selected.length > 0}
            <PillMenuButton icon={QrCode} click={() => window.open(`/app/scm/articles/print/?articles=${selected.join(',')}`, '_blank')?.focus()}>Imprimer les étiquettes</PillMenuButton>
        {/if}
    </PillMenu>

    <div class="w-2/3">
        <Filter2 bind:filter bind:filters availableFilters={[
            { name: "name", default: true, type: "string" },
            { name: "reference", type: "string" },
            { name: "manufacturer", type: "string" },
            { name: "critical_quantity", type: "number"},
            { name: "consumable", type: "boolean" }
        ]} />
    </div>

    <Table embeded={true}>
        <svelte:fragment slot="head">
            <TableTitle colWidth="w-8"><input type="checkbox" checked={selectedAll} on:click={() => selected = selectedAll ? [] : data.articles.map(k => k.id)} /></TableTitle>
            <TableTitle col="name" bind:activeSort>Article ({data.totalItems})</TableTitle>
            <TableTitle col="consumable" bind:activeSort>Consommable ?</TableTitle>
            <TableTitle col="quantity" bind:activeSort>Stock</TableTitle>
            <TableTitle col="store.name" bind:activeSort>Emplacement</TableTitle>
            <TableTitle col="reference" bind:activeSort>Référence</TableTitle>
            <TableTitle>Fournisseurs</TableTitle>
            <TableTitle col="brand" bind:activeSort>Marque</TableTitle>
            <TableTitle col="price" bind:activeSort>PUMP</TableTitle>
            <TableTitle>Total prix stock</TableTitle>
        </svelte:fragment>
    
        <svelte:fragment slot="body">
            {#each data.articles as article (article.id)}

                {@const price = article.order_rows.filter(or => or.order.state === "received").reduce((c, p) => (p.ack_price ?? 0) * p.received_quantity + c, 0)}
                {@const stock_quantity = article.store_relations.filter(sr => !sr.store.temporary).reduce((c, p) => p.quantity + c, 0)}

                <TableRow>
                    <TableCell><input type="checkbox" bind:group={selected} value={article.id} /></TableCell>
                    <TableCell>
                        <ArticleRow {article} displayPrice={false} displayManufacturer={false} displayApprox />
                    </TableCell>
                    <TableCell>
                        <RoundedLabel role={article.consumable ? "success" : "danger"}>{article.consumable ? "Oui" : "Non"}</RoundedLabel>
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
                        <Flex gap={2} direction="col" items="start">
                            {#if article.expand?.["article_suppliers(article)"] !== undefined}
                                {#each article.expand?.["article_suppliers(article)"] as supplierRelation}
                                    <Supplier supplier={supplierRelation.expand?.supplier} />
                                {/each}
                            {:else}
                                —
                            {/if}
                        </Flex>
                    </TableCell>
                    <TableCell>{(article.internal) ? env.PUBLIC_COMPANY_NAME : article.brand}</TableCell>
                    
                    <TableCell><Price value={price} /></TableCell>
                    <TableCell><Price value={price * stock_quantity} /></TableCell>
                </TableRow>
            {/each}
        </svelte:fragment>
    </Table>
    
    <TablePages totalPages={data.totalItems % 50} bind:currentPage={itemsPage} />
</Wrapper>