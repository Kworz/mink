<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import type { FilterCondition } from "$lib/components/filter/filter2";
    import Filter2 from "../filter/Filter2.svelte";

    import Button from "../Button.svelte";
    import Flex from "../layout/flex.svelte";
    import ArticleRow from "./ArticleRow.svelte";
    import type { SCMArticle } from "@prisma/client";

    const dispatch = createEventDispatcher();

    let filter = "";
    
    export let articles: Array<SCMArticle>;
    export let filters: Array<FilterCondition> = [];
    export let selectedArticle: SCMArticle | undefined = undefined;
    export let formFieldName: string | undefined = undefined;

    $: dispatch("refreshArticles", filter);

</script>

<Flex direction="col" items="start" gap={4} class="w-full">
    {#if selectedArticle === undefined}
        <Flex gap={6} wrap={"nowrap"} class="w-full overflow-x-scroll snap-x">
            {#each articles as article (article.id)}
                <button on:click|preventDefault={() => { selectedArticle = article }} class="aspect-[8] snap-start snap-mandatory text-left hover:bg-violet-500/10 duration-300 rounded-md p-6 drop-shadow-sm bg-gray-200 dark:bg-zinc-700">
                    <ArticleRow bind:article />
                </button>
            {/each}
        </Flex>
        <Filter2 bind:filter={filter} bind:filters={filters} availableFilters={[
            { name: "name", default: true, type: "string" },
            { name: "reference", type: "string" },
            { name: "manufacturer", type: "string" }
        ]} />
    {:else}
        <ArticleRow bind:article={selectedArticle} />
        {#if formFieldName !== undefined} <input type="hidden" name={formFieldName} bind:value={selectedArticle.id} /> {/if}
        <Button size="small" role="danger" class="mt-4" on:click={() => selectedArticle = undefined}>Déselectionner</Button>
    {/if}
</Flex>

