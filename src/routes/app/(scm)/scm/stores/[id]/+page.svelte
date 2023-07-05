<script lang="ts">
    import Wrapper from "$lib/components/Wrapper.svelte";
    import TableCell from "$lib/components/table2/TableCell.svelte";
    import Table from "$lib/components/table2/Table.svelte";
import type { PageData } from "./$types";
    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import TablePages from "$lib/components/table/TablePages.svelte";
    import { page } from "$app/stores";
    import type { FilterCondition } from "$lib/components/filter/filter2";
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

<Wrapper>
    <h3>Stock: {data.store.name}</h3>
    <p>Emplacement: {data.store.location}</p>
    <p>Stock temporaire: {data.store.temporary}</p>
</Wrapper>

<Wrapper class="mt-6">

    <TablePages totalPages={data.storeRelations.totalPages} bind:currentPage={itemsPage} />

    <Table headers={[{ label: "Article", colname: "article.name" }, { label: "Quantité", colname: "quantity" }]} bind:activeSort>
        {#each data.storeRelations.items as relation}
            <TableCell>
                <ArticleRow article={relation.expand.article} />
            </TableCell>
            <TableCell>{relation.quantity}</TableCell>
        {/each}
    </Table>

</Wrapper>