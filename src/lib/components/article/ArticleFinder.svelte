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
    import { getPocketbase } from "../pocketbase";
    import Wrapper from "../Wrapper.svelte";
    import ArticleRow from "./ArticleRow.svelte";

    let articleList: Array<ArticleResponseExpanded> = [];

    let filter = "";
    export let filters: Array<FilterCondition> = [];
    export let selectedArticle: ArticleResponseExpanded | undefined = undefined;

    let pb: PocketBase | undefined = undefined;

    const refreshArticles = async () => {
        try
        {
            const articles = await pb?.collection(Collections.Article).getList<ArticleResponseExpanded>(1, 50, { filter: decodeURIComponent(filter), expand: "supplier" });
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
        
        pb = await getPocketbase(document.cookie);
        refreshArticles();

    });

    $: filter, refreshArticles();

</script>

{#if selectedArticle === undefined}
    <Flex direction="col">
        <Flex gap={4} wrap={"nowrap"} class="overflow-y-scroll w-full p-1">
            {#each articleList.slice(-10) as article (article.id)}
                <Wrapper class="min-w-[50%]">
                    <button on:click|preventDefault={() => selectedArticle = article} class="text-left">
                        <ArticleRow {article} />
                    </button>
                </Wrapper>
            {/each}
        </Flex>
        <Filter2 bind:filter={filter} bind:filters={filters} availableFilters={[
            { name: "name", default: true },
            { name: "reference" },
            { name: "manufacturer" }
        ]} />
    </Flex>
{:else}
    <ArticleRow article={selectedArticle} />
    <Button size="small" role="danger" class="mt-2" on:click={() => selectedArticle = undefined}>Déselectionner</Button>
{/if}

