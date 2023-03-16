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
    export let data: PageData;

    let filters: Array<FilterCondition> = [];
    let filter: string = "";

    let displayThumbs = true;
    let selected: Array<string> = [];

    let activeSort = $page.url.searchParams.get("sort") ?? "name";
    let itemsPage = Number($page.url.searchParams.get("page")) ?? 1;

    export const snapshot: Snapshot<Array<FilterCondition>> = {
        capture: () => filters,
        restore: (value) => filters = value
    }

    const triggerRefresh = () => {
        if(browser) {
            goto(`/app/articles?sort=${activeSort}&page=${itemsPage}&filter=${filter}`, { noScroll: true });
            selected = [];
        }
    }

    $: filter, activeSort, itemsPage, triggerRefresh();  
    $: selectedAll = data.articleList.items.length === selected.length;

</script>

<svelte:head>
    <title>Nomenclaturize — Articles</title>
</svelte:head>

<Wrapper class="mb-6">

    <h2>Articles</h2>
    <p>Liste des articles disponible dans la base.</p>
    <h4 class="mt-3">Réglages liste</h4>
    <p><input type="checkbox" bind:checked={displayThumbs} /> Afficher les miniatures.</p>

</Wrapper>

<Wrapper class="relative">
    
    <PillMenu>
        <PillMenuButton icon={PlusCircle} href="/app/articles/new">Créer un article</PillMenuButton>
        <PillMenuButton icon={ArrowDownTray} href="/app/articles/import" role="secondary">Importer des articles</PillMenuButton>
        <PillMenuButton icon={ArrowUpTray} on:click={() => window.open(`/app/articles/export/`, '_blank')?.focus()} role="secondary">Exporter les articles</PillMenuButton>
        {#if selected.length > 0}
            <PillMenuButton icon={QrCode} on:click={() => window.open(`/app/articles/print/?articles=${selected.join(',')}`, '_blank')?.focus()}>Imprimer les étiquettes</PillMenuButton>
        {/if}
    </PillMenu>

    <div class="w-2/3">
        <Filter2 bind:filter bind:filters availableFilters={[
            { name: "name", default: true },
            { name: "reference" },
            { name: "manufacturer" },
            { name: "supplier.name" },
            { name: "store.name"},
            { name: "price" },
            { name: "quantity" }
        ]} />
    </div>


    <Table embeded={true}>
        <svelte:fragment slot="head">
            <TableTitle colWidth="w-8"><input type="checkbox" checked={selectedAll} on:click={() => selected = selectedAll ? [] : data.articleList.items.map(k => k.id)}/></TableTitle>
            <TableTitle colWidth="w-1/3" col="name" bind:activeSort>Article ({data.articleList.totalItems})</TableTitle>
            <TableTitle col="quantity" bind:activeSort>Stock</TableTitle>
            <TableTitle col="store.name" bind:activeSort>Emplacement</TableTitle>
            <TableTitle col="reference" bind:activeSort>Référence</TableTitle>
            <TableTitle col="supplier" bind:activeSort colWidth="w-1/6">Fournisseur</TableTitle>
            <TableTitle col="manufacturer" bind:activeSort>Fabricant</TableTitle>
            <TableTitle col="price" bind:activeSort>Prix</TableTitle>
            <TableTitle>Prix stock</TableTitle>
        </svelte:fragment>
    
        <svelte:fragment slot="body">
            {#each data.articleList.items as article (article.id)}
                <TableRow>
                    <TableCell><input type="checkbox" bind:group={selected} value={article.id} /></TableCell>
                    <TableCell>
                        <ArticleRow {article} displayPrice={false} displayManufacturer={false} bind:displayThumb={displayThumbs} displayApprox={true} />
                    </TableCell>
                    <TableCell>{article.quantity}</TableCell>
                    <TableCell>
                        {#if article.expand?.store !== undefined}
                            <Store store={article.expand.store} />
                        {/if}
                    </TableCell>
                    <TableCell>{article.reference}</TableCell>
                    <TableCell>
                        <Flex gap={2} direction="col" items="start">
                            {#if article.expand?.supplier !== undefined}
                                {#each article.expand.supplier as supplier}
                                    <Supplier {supplier} />
                                {/each}
                            {:else}
                                —
                            {/if}
                        </Flex>
                    </TableCell>
                    <TableCell>{article.manufacturer}</TableCell>
                    <TableCell>{article.price ?? "—"} €</TableCell>
                    <TableCell>{(article.price) ?? 0 * (Number(article.quantity) ?? 0)} €</TableCell>
                </TableRow>
            {/each}
        </svelte:fragment>
    </Table>
    
    <TablePages totalPages={data.articleList.totalPages} bind:currentPage={itemsPage} />
</Wrapper>