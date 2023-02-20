<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import Button from "$lib/components/Button.svelte";
    import { filterCompatible, type FilterQueryResult } from "$lib/components/filter/filter";
    import Filter from "$lib/components/filter/Filter.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Table from "$lib/components/Table.svelte";
    import TableTitle from "$lib/components/table/TableTitle.svelte";
    import type { ArticleResponse } from "$lib/DBTypes";

    import type { PageData, Snapshot } from "./$types";
    export let data: PageData;

    let filterQuery: FilterQueryResult<"name" | "manufacturer" | "supplier" | "reference"> = {};
    let filter = "";

    let activeSort = $page.url.searchParams.get("sort") ?? "name";

    const filterFn = (article: ArticleResponse, filterQ: typeof filterQuery): boolean => {

        let result = true;

        if(filterQuery.name !== undefined)
            result = result && filterCompatible(article.name, filterQuery.name)
        if(filterQuery.manufacturer !== undefined && article.manufacturer !== undefined)
            result = result && filterCompatible(article.manufacturer, filterQuery.manufacturer)
        if(filterQuery.reference !== undefined && article.reference !== undefined)
            result = result && filterCompatible(article.reference, filterQuery.reference)
        if(filterQuery.supplier !== undefined && article.supplier !== undefined)
            result = result && filterCompatible(article.supplier, filterQuery.supplier)

        return result;
    }

    export const snapshot: Snapshot<string> = {
        capture: () => filter,
        restore: (value) => filter = value
    }

    export const setSort = (value: string) => {
        activeSort = value;
        goto(`/app/articles?sort=${value}`)
    }

</script>

<svelte:head>
    <title>Nomenclaturize — Articles</title>
</svelte:head>

<h2>Articles</h2>
<p>Liste des articles disponible dans la base.</p>

<Flex class="mt-8">
    <Filter bind:filter availableFilters={["name", "manufacturer", "supplier", "reference"]} bind:filterResult={filterQuery} />
    <a href="/app/articles/new"><Button>Créer un article</Button></a>
    <a href="/app/articles/import"><Button borderColor="border-blue-500" hoverColor="hover:bg-blue-500">Importer des articles</Button></a>
</Flex>

<Table>
    <svelte:fragment slot="head">
        <tr>
            <TableTitle col="name" {activeSort} sortFn={setSort}>Article</TableTitle>
            <TableTitle col="quantity" {activeSort} sortFn={setSort}>Quantité disponible</TableTitle>
            <TableTitle col="reference" {activeSort} sortFn={setSort}>Référence</TableTitle>
            <TableTitle col="supplier" {activeSort} sortFn={setSort}>Fournisseur</TableTitle>
            <TableTitle col="manufacturer" {activeSort} sortFn={setSort}>Fabricant</TableTitle>
            <TableTitle col="price" {activeSort} sortFn={setSort}>Prix</TableTitle>
        </tr>
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#each data.articles.filter((k) => filterFn(k, filterQuery)) as article (article.id)}
            <tr>
                <td><a href="/app/articles/{article.id}" class="font-medium hover:text-violet-500 duration-100">{article.name}</a></td>
                <td>{article.quantity}</td>
                <td>{article.reference}</td>
                <td>{article.supplier}</td>
                <td>{article.manufacturer}</td>
                <td>{article.price ?? "—"} €</td>
            </tr>
        {/each}
    </svelte:fragment>
</Table>

<style>

    td {

        @apply p-4 border-b border-b-violet-500/25;
    }

    tr:last-child > td{
        @apply border-0;
    }
</style>