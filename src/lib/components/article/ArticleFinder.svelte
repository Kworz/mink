<script lang="ts">
    import type PocketBase from "pocketbase";
    import { browser } from "$app/environment";
    import { Collections } from "$lib/DBTypes";
    import { onMount } from "svelte";

    import type { FilterCondition } from "$lib/components/filter/filter2";
    import Filter2 from "../filter/Filter2.svelte";

    import type { ArticleResponseExpanded } from "../../../routes/app/articles/+page.server";
    import Button from "../Button.svelte";
    import Flex from "../layout/flex.svelte";
    import ArticleRow from "./ArticleRow.svelte";
    import { page } from "$app/stores";

    let articleList: Array<ArticleResponseExpanded> = [];

    let filter = "";
    export let filters: Array<FilterCondition> = [];
    export let selectedArticle: ArticleResponseExpanded | undefined = undefined;
    export let formFieldName: string | undefined = undefined;

    const refreshArticles = async () => {

        try
        {
            const articles = await $page.data.pb?.collection(Collections.Article).getList<ArticleResponseExpanded>(1, 15, { filter: decodeURIComponent(filter), expand: "supplier", sort: "-updated" });
            articleList = articles?.items ?? []; 
        }
        catch(ex)
        {
            console.log(ex);
        }
    }

    onMount(async () => {

        if(!browser)
            return;
        
        refreshArticles();

    });

    $: filter, refreshArticles();

</script>

<Flex direction="col" items="start" gap={4}>
    {#if selectedArticle === undefined}
        <Flex gap={6} wrap={"nowrap"} class="overflow-x-scroll snap-x">
            {#each articleList as article (article.id)}
                <button on:click|preventDefault={() => { selectedArticle = article }} class="aspect-[8] snap-start snap-mandatory text-left hover:bg-violet-500/10 duration-300 rounded-md p-6 drop-shadow-sm bg-gray-200 dark:bg-zinc-700">
                    <ArticleRow bind:article />
                </button>
            {/each}
        </Flex>
        <Filter2 bind:filter={filter} bind:filters={filters} availableFilters={[
            { name: "name", default: true },
            { name: "reference" },
            { name: "manufacturer" }
        ]} />
    {:else}
        <ArticleRow bind:article={selectedArticle} />
        {#if formFieldName !== undefined} <input type="hidden" name={formFieldName} bind:value={selectedArticle.id} /> {/if}
        <Button size="small" role="danger" class="mt-4" on:click={() => selectedArticle = undefined}>Déselectionner</Button>
    {/if}
</Flex>

