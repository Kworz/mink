<script lang="ts">

    import type { ArticleResponse } from "$lib/DBTypes";
    export let article: ArticleResponse;

    /** Wether the stock should be displayed or not */
    export let displayStock = false;

</script>

<a href="/app/articles/{article.id}" class="block font-medium hover:text-violet-500">{article.name}</a>
<span class="text-sm block">{article.manufacturer}: {article.reference}</span>
<span class="text-sm block">{article.supplier}: {article.price} €</span>
{#if Number(article.quantity) > 0 && displayStock === true} <span class="text-sm text-emerald-600 block">{article.quantity} En stock.</span> {/if}