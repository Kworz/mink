<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import type { FilterCondition } from "$lib/components/derived/filter/filter2";
    import type { scm_articleWithIncludes } from "$lib/components/derived/article/article";
    
    import Filter2 from "$lib/components/derived/filter/Filter2.svelte";
    import Button from "$lib/components/generics/Button.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import ArticleRow from "$lib/components/derived/article/ArticleRow.svelte";

    const dispatch = createEventDispatcher();

    let filter = "";
    
    export let articles: scm_articleWithIncludes[];
    export let selectedArticle: scm_articleWithIncludes | undefined = undefined;

    export let filters: Array<FilterCondition> = [];
    export let formFieldName: string | undefined = undefined;

    $: dispatch("refreshArticles", filter);

</script>

<Flex direction="col" items="start" gap={4} class="w-full">
    {#if selectedArticle === undefined}
        <Flex gap={6} wrap={"nowrap"} class="w-full overflow-x-scroll snap-x">
            {#each articles as article (article.id)}
                <button on:click|preventDefault={() => { selectedArticle = article }} class="aspect-[8] snap-start snap-mandatory text-left hover:bg-zinc-600/25 duration-300 rounded-md p-4 ring-1 ring-inset ring-zinc-400/25">
                    <ArticleRow bind:article />
                </button>
            {/each}
        </Flex>
        <Filter2 class="w-full" bind:filter={filter} bind:filters={filters} availableFilters={[
            { name: "name", default: true, type: "string" },
            { name: "reference", type: "string" },
            { name: "manufacturer", type: "string" }
        ]} />
    {:else}
        <div class="aspect-[8] text-left rounded-md p-4 ring-1 ring-inset ring-zinc-400/25">
            <ArticleRow bind:article={selectedArticle} /> 
        </div>
        {#if formFieldName !== undefined} <input type="hidden" name={formFieldName} bind:value={selectedArticle.id} /> {/if}
        <Button size="small" role="danger" preventSend on:click={() => selectedArticle = undefined}>Déselectionner</Button>
    {/if}
</Flex>

