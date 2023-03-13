<script lang="ts">

    import type { ArticleResponseExpanded } from "../../../routes/app/articles/+page.server";
    import Button from "../Button.svelte";
    import { filterCompatible, type FilterQueryResult } from "../filter/filter";
    import Filter from "../filter/Filter.svelte";
    import Flex from "../layout/flex.svelte";
    import Wrapper from "../Wrapper.svelte";
    import ArticleRow from "./ArticleRow.svelte";
    export let articleList: Array<ArticleResponseExpanded>;
    export let selectedArticle: ArticleResponseExpanded | undefined = undefined;

    let filterResult: FilterQueryResult<"name" | "manufacturer" | "reference"> = {};

    const filterFunction = (article: ArticleResponseExpanded, filter: typeof filterResult) => {
        let result = true;

        if(filterResult.name !== undefined)
            result = result && filterCompatible(article.name, filterResult.name)
        if(filterResult.manufacturer !== undefined)
            result = result && filterCompatible(article.manufacturer, filterResult.manufacturer)
        if(filterResult.reference !== undefined)
            result = result && filterCompatible(article.reference, filterResult.reference)

        return result;
    }

    $: filteredArticles = articleList.filter((k) => filterFunction(k, filterResult));

</script>

{#if selectedArticle === undefined}
    <Flex direction="col">
        <Flex gap={4} wrap={"nowrap"} class="overflow-y-scroll w-full p-1">
            {#each filteredArticles.slice(-10) as article}
                <Wrapper class="min-w-[50%]">
                    <button on:click|preventDefault={() => selectedArticle = article} class="text-left">
                        <ArticleRow {article} />
                    </button>
                </Wrapper>
            {/each}
        </Flex>
        <Filter class="w-full" bind:filterResult availableFilters={["name", "manufacturer", "reference"]} />
    </Flex>
{:else}
    <ArticleRow article={selectedArticle} />
    <Button size="small" role="danger" class="mt-2" on:click={() => selectedArticle = undefined}>Déselectionner</Button>
{/if}

