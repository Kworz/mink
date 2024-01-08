<script lang="ts">
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import type { PageData } from "./$types";
    import ArticleRow from "$lib/components/derived/article/ArticleRow.svelte";
    import { page } from "$app/stores";
    import type { FilterCondition } from "$lib/components/derived/filter/filter2";
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";

    export let data: PageData;

    let filters: Array<FilterCondition> = [];
    let filter: string = $page.url.searchParams.get("filter") ?? "";

    let selected: Array<string> = [];

    let activeSort = $page.url.searchParams.get("sort") ?? "article.name";
    let itemsPage = Number($page.url.searchParams.get("page")) ?? 1;

    const triggerRefresh = () => {
        if(browser) {
            goto(`/app/scm/stores/${$page.params.id}?sort=${activeSort}&page=${itemsPage}&filter=${filter}`, { noScroll: true });
            selected = [];
        }
    }

    $: filter, activeSort, itemsPage, triggerRefresh();  

</script>

<svelte:head>
    <title>Stocks — {data.store.name} / {data.store.location}</title>
</svelte:head>

<h1>Stock: {data.store.name}</h1>
<p>Emplacement: {data.store.location}</p>
<p>Stock temporaire: {data.store.temporary}</p>

<Table headers={[{ label: "Article", colname: "article.name" }, { label: "Quantité", colname: "quantity" }]} bind:sorts={activeSort} class="mt-6">
    {#each data.store.store_relations as relation}
        <TableCell>
            <ArticleRow article={relation.article} />
        </TableCell>
        <TableCell>{relation.quantity}</TableCell>
    {/each}
</Table>