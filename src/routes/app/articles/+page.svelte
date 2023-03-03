<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import Button from "$lib/components/Button.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import { filterCompatible, type FilterQueryResult } from "$lib/components/filter/filter";
    import Filter from "$lib/components/filter/Filter.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Supplier from "$lib/components/supplier/Supplier.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableTitle from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";

    import type { PageData, Snapshot } from "./$types";
    export let data: PageData;

    let filterQuery: FilterQueryResult<"name" | "manufacturer" | "supplier" | "reference"> = {};
    let filter = "";

    let displayThumbs = true;
    let selected: Array<string> = [];

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

    const labelPrint = () => {
        window.open(`/app/articles/print/?articles=${selected.join(',')}`, '_blank')?.focus();
    }

    export const snapshot: Snapshot<string> = {
        capture: () => filter,
        restore: (value) => filter = value
    }

    export const setSort = (value: string) => {
        activeSort = value;
        goto(`/app/articles?sort=${value}`);
    }

</script>

<svelte:head>
    <title>Nomenclaturize — Articles</title>
</svelte:head>

<h2>Articles</h2>
<p>Liste des articles disponible dans la base.</p>
<p>Valeur du stock: <DetailLabel>{data.articles.reduce((p, c) => (c.price ?? 0) * (Number(c.quantity) ?? 0) + p, 0)} €</DetailLabel>.</p>
<h4 class="mt-3">Réglages liste</h4>
<p><input type="checkbox" bind:checked={displayThumbs} /> Afficher les miniatures.</p>

<Flex class="mt-6">
    <Filter bind:filter availableFilters={["name", "manufacturer", "supplier", "reference"]} bind:filterResult={filterQuery} />
    <a href="/app/articles/new"><Button>Créer un article</Button></a>    
    <a href="/app/articles/import"><Button borderColor="border-blue-500" hoverColor="hover:bg-blue-500">Importer des articles</Button></a>
    <Button borderColor="border-blue-500" hoverColor="hover:bg-blue-500" on:click={() => {
        window.open(`/app/articles/export/`, '_blank')?.focus();
    }}>
        Export
    </Button>
    {#if selected.length > 0}
        <Button borderColor="border-pink-500" hoverColor="hover:bg-pink-500" on:click={labelPrint}>Imprimer etiquettes</Button>
    {/if}
</Flex>

<Table>
    <svelte:fragment slot="head">
        <TableTitle colWidth="w-8"></TableTitle>
        <TableTitle col="name" {activeSort} sortFn={setSort} colWidth="w-1/6">Article</TableTitle>
        <TableTitle col="quantity" {activeSort} sortFn={setSort}>Stock</TableTitle>
        <TableTitle col="reference" {activeSort} sortFn={setSort}>Référence</TableTitle>
        <TableTitle col="supplier" {activeSort} sortFn={setSort} colWidth="w-1/6">Fournisseur</TableTitle>
        <TableTitle col="manufacturer" {activeSort} sortFn={setSort}>Fabricant</TableTitle>
        <TableTitle col="price" {activeSort} sortFn={setSort}>Prix</TableTitle>
        <TableTitle>Prix global</TableTitle>
        <TableTitle col="label" {activeSort} sortFn={setSort}>Etiquette</TableTitle>
        <TableTitle col="updated" {activeSort} sortFn={setSort}>Updated</TableTitle>
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#each data.articles.filter((k) => filterFn(k, filterQuery)) as article (article.id)}
            <TableRow>
                <TableCell><input type="checkbox" bind:group={selected} value={article.id} /></TableCell>
                <TableCell>
                    <ArticleRow {article} displayPrice={false} displayManufacturer={false} bind:displayThumb={displayThumbs} />
                </TableCell>
                <TableCell>{article.quantity}</TableCell>
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
                <TableCell>
                    <form action="/app/articles/{article.id}?/editArticle" method="post" use:enhance>
                        <FormInput type="checkbox" name="label" validateOnChange={true} bind:checked={article.label}/>
                    </form>
                </TableCell>
                <TableCell>{article.updated}</TableCell>
            </TableRow>
        {/each}
    </svelte:fragment>
</Table>