<script lang="ts">
    import { browser } from "$app/environment";

    import type { ArticleResponseExpanded } from "../../../routes/app/articles/+page.server";
    import DetailLabel from "../DetailLabel.svelte";
    import Flex from "../layout/flex.svelte";
    export let article: ArticleResponseExpanded;

    /** Wether the stock should be displayed or not */
    export let displayStock = false;
    
    /** Wether the thumb image is displayed or not */
    export let displayThumb = true;

    /** Wether the supplier and price are displayed */
    export let displayPrice = true;

    /** Wether the manufacturer and reference are displayed */
    export let displayManufacturer = true;

</script>

<Flex items="center">

    {#if displayThumb === true && article.pinned_file !== undefined && article.attached_files?.includes(article.pinned_file) && browser}
        <img src="http://{window.location.hostname}:8090/api/files/{article.collectionName}/{article.id}/{article.pinned_file}?thumb=200x200" alt={article.pinned_file} class="aspect-square object-cover h-20 rounded-md border border-zinc-500/50" />
    {/if}

    <div>
        <a href="/app/articles/{article.id}" class="block">{article.name}</a>
        {#if displayManufacturer}<span class="text-sm block">{article.manufacturer}: <DetailLabel>{article.reference}</DetailLabel></span>{/if}
        {#if displayPrice}<span class="text-sm block"><DetailLabel>{article.price} €</DetailLabel></span>{/if}
        {#if (article.quantity ?? 0) > 0 && displayStock === true} <span class="text-sm text-emerald-600 block">{article.quantity} En stock.</span> {/if}
    </div>
</Flex>
