<script lang="ts">

    import type { ArticleResponse } from "$lib/DBTypes";
    import DetailLabel from "../DetailLabel.svelte";
    import Flex from "../layout/flex.svelte";
    export let article: ArticleResponse;

    /** Wether the stock should be displayed or not */
    export let displayStock = false;
    
    /** Wether the thumb image is displayed or not */
    export let displayThumb = true;

</script>

<Flex items="center">

    {#if displayThumb === true && article.pinned_file !== undefined && article.attached_files?.includes(article.pinned_file)}
        <img src="http://192.168.49.240:8090/api/files/{article.collectionName}/{article.id}/{article.pinned_file}?thumb=200x200" alt={article.pinned_file} class="aspect-square object-cover h-20 rounded-md border border-zinc-500/50" />
    {/if}

    <div>
        <a href="/app/articles/{article.id}" class="block font-medium hover:text-violet-500">{article.name}</a>
        <span class="text-sm block">{article.manufacturer}: <DetailLabel>{article.reference}</DetailLabel></span>
        <span class="text-sm block">{article.supplier}: <DetailLabel>{article.price} €</DetailLabel></span>
        {#if Number(article.quantity) > 0 && displayStock === true} <span class="text-sm text-emerald-600 block">{article.quantity} En stock.</span> {/if}
    </div>
</Flex>
