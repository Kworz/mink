<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import { filterCompatible, type FilterQueryResult } from "$lib/components/filter/filter";
    import Filter from "$lib/components/filter/Filter.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Table from "$lib/components/Table.svelte";
    import type { ArticleResponse } from "$lib/DBTypes";

    import type { PageData } from "./$types";
    export let data: PageData;

    let filterQuery: FilterQueryResult<"name" | "manufacturer" | "supplier" | "reference"> = {};

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

</script>

<h2>Articles</h2>
<p>Liste des articles disponible dans la base.</p>

<Flex class="mt-8">
    <Filter availableFilters={["name", "manufacturer", "supplier", "reference"]} bind:filterResult={filterQuery} />
    <a href="/app/articles/new"><Button>Ajouter un article</Button></a>
    <a href="/app/articles/import"><Button borderColor="border-blue-500" hoverColor="hover:bg-blue-500">Importer des articles</Button></a>
</Flex>

<Table>
    <svelte:fragment slot="head">
        <tr>
            <th>Article</th>
            <th>Quantité disponible</th>
            <th>Référence</th>
            <th>Fournisseur</th>
            <th>Fabricant</th>
            <th>Prix</th>
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

    th {
        @apply p-4 border-b border-b-violet-500/75 text-left;
    }

    td {

        @apply p-4 border-b border-b-violet-500/25;
    }

    tr:last-child > td{
        @apply border-0;
    }
</style>