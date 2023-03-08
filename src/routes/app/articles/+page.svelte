<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
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
    export let data: PageData;

    let filters: Array<FilterCondition> = [];
    let filter: string = "";

    let displayThumbs = true;
    let selected: Array<string> = [];

    let activeSort = $page.url.searchParams.get("sort") ?? "name";
    let itemsPage = $page.url.searchParams.get("page") ?? 1;

    export const snapshot: Snapshot<Array<FilterCondition>> = {
        capture: () => filters,
        restore: (value) => filters = value
    }

    const labelPrint = () => {
        window.open(`/app/articles/print/?articles=${selected.join(',')}`, '_blank')?.focus();
    }

    const setSort = (value: string) => {
        activeSort = value;
    }

    const invalidateParams = () => {
        if(browser)
        {
            goto(`/app/articles?sort=${activeSort}&page=${itemsPage}&filter=${filter}`);
            selected = [];
        }
    }

    $: filter, activeSort, itemsPage, invalidateParams();
    $: selectedAll = data.articleList.items.length === selected.length;

</script>

<svelte:head>
    <title>Nomenclaturize — Articles</title>
</svelte:head>

<h2>Articles</h2>
<p>Liste des articles disponible dans la base.</p>
<h4 class="mt-3">Réglages liste</h4>
<p><input type="checkbox" bind:checked={displayThumbs} /> Afficher les miniatures.</p>

<Flex class="mt-6">
    <Filter2 bind:filter bind:filters />
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
        <TableTitle colWidth="w-8"><input type="checkbox" checked={selectedAll} on:click={() => selected = selectedAll ? [] : data.articleList.items.map(k => k.id)}/></TableTitle>
        <TableTitle col="name" {activeSort} sortFn={setSort} colWidth="w-1/6">Article ({data.articleList.totalItems})</TableTitle>
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
        {#each data.articleList.items as article (article.id)}
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

{#if data.articleList.totalPages > 1}
    <Flex class="mt-6">
        <h5>Pages</h5>
        {#each [...Array(data.articleList.totalPages).keys()] as number}
            {@const current = number+1 === itemsPage}
            <Button 
                class="aspect-square w-8"
                size="tiny"
                borderColor={current ? "border-violet-400" : "border-zinc-500"}
                hoverColor={current ? "bg-violet-400 hover:bg-violet-500" : "hover:bg-zinc-500"}
                textColor={current ? "text-white" : undefined}
                on:click={() => itemsPage = number+1}
            >{number + 1}</Button>
        {/each}
    </Flex>
{/if}
