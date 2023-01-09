<script lang="ts">
    import type { ArticleResponse } from "$lib/DBTypes";
    import Flex from "./layout/flex.svelte";

    export let articleArray: Array<ArticleResponse>;
    export let selectedArticle: undefined | ArticleResponse;

    let value = "";

    let focused = false;

    const filterArray = (k: ArticleResponse, filter: string): boolean => {
        return k.name.toLowerCase().includes(filter.toLowerCase());
    }

    $: articleFiltered = articleArray.filter(k => filterArray(k, value));

</script>
<div class="relative {$$props.class}"> 

    <input type="text" bind:value class="p-2 border border-zinc-500 bg-zinc-100 rounded-sm" placeholder="Rechercher un article" on:focus={() => focused = true} />

    {#if focused}
        <div class="absolute top-12 z-30 w-max">
            <Flex direction="col" gap={2}>
                {#each articleFiltered.slice(0, 5) as article}
                    <button 
                        class="p-2 bg-white border-2 border-violet-500/50 rounded-md text-left"
                        on:click|preventDefault={() => {
                            selectedArticle = article;
                            value = article.name;
                            focused = false;
                        }}
                    >
                        <h4>{article.name}</h4>
                        <p>
                            <span>{article.manufacturer} / {article.supplier}</span>
                            <span>{article.reference}</span>
                        </p>
                    </button>
                {/each}
            
            </Flex>
        </div>
    {/if}
</div>

