<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import Button from "$lib/components/Button.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import { filterCompatible, type FilterQueryResult } from "$lib/components/filter/filter";
    import Filter from "$lib/components/filter/Filter.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableTitle from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";

    import type { PageData, Snapshot } from "./$types";
    export let data: PageData;

    let filterQuery: FilterQueryResult<"name" | "manufacturer" | "supplier" | "reference"> = {};
    let filter = "";

    let activeSort = $page.url.searchParams.get("sort") ?? "name";

    const filterFn = (article: typeof data.articles[number], filterQ: typeof filterQuery): boolean => {

        let result = true;

        if(filterQuery.name !== undefined)
            result = result && filterCompatible(article.name, filterQuery.name)
        if(filterQuery.manufacturer !== undefined)
            result = result && filterCompatible(article.manufacturer, filterQuery.manufacturer)
        if(filterQuery.reference !== undefined)
            result = result && filterCompatible(article.reference, filterQuery.reference)
        if(filterQuery.supplier !== undefined)
            result = result && filterCompatible(article.expand?.supplier?.name, filterQuery.supplier)

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
<p>Valeur du stock: <DetailLabel>{data.articles.reduce((p, c) => (c.price ?? 0) * (Number(c.quantity) ?? 0) + p, 0)} €</DetailLabel>.</p>

<Flex class="mt-8">
    <Filter bind:filter availableFilters={["name", "manufacturer", "supplier", "reference"]} bind:filterResult={filterQuery} />
    <a href="/app/articles/new"><Button>Créer un article</Button></a>
    <a href="/app/articles/scan"><Button>Scanner code QR</Button></a>
    
    <a href="/app/articles/import"><Button borderColor="border-blue-500" hoverColor="hover:bg-blue-500">Importer des articles</Button></a>
    <Button borderColor="border-blue-500" hoverColor="hover:bg-blue-500" on:click={() => {
        window.open(`/app/articles/export/`, '_blank')?.focus();
    }}>
        Export
    </Button>
</Flex>

<Table>
    <svelte:fragment slot="head">
        <TableTitle col="name" {activeSort} sortFn={setSort}>Article</TableTitle>
        <TableTitle>Miniature</TableTitle>
        <TableTitle col="quantity" {activeSort} sortFn={setSort}>Quantité disponible</TableTitle>
        <TableTitle col="reference" {activeSort} sortFn={setSort}>Référence</TableTitle>
        <TableTitle col="supplier" {activeSort} sortFn={setSort}>Fournisseur</TableTitle>
        <TableTitle col="manufacturer" {activeSort} sortFn={setSort}>Fabricant</TableTitle>
        <TableTitle col="price" {activeSort} sortFn={setSort}>Prix</TableTitle>
        <TableTitle>Prix global</TableTitle>
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#each data.articles.filter((k) => filterFn(k, filterQuery)) as article (article.id)}
            <TableRow>
                <TableCell><a href="/app/articles/{article.id}" class="font-medium hover:text-violet-500 duration-100">{article.name}</a></TableCell>
                <TableCell>
                    {#if (article.pinned_file !== undefined && article.attached_files?.includes(article.pinned_file))}
                        <span class="text-emerald-500 font-semibold">Oui</span>
                    {:else}
                        <span class="text-red-500 font-semibold">Non</span>
                    {/if}
                </TableCell>
                <TableCell>{article.quantity}</TableCell>
                <TableCell>{article.reference}</TableCell>
                <TableCell>{article.expand?.supplier?.name ?? "—"}</TableCell>
                <TableCell>{article.manufacturer}</TableCell>
                <TableCell>{article.price ?? "—"} €</TableCell>
                <TableCell>{(article.price) ?? 0 * (Number(article.quantity) ?? 0)} €</TableCell>
            </TableRow>
        {/each}
    </svelte:fragment>
</Table>