<script lang="ts">

    import type { ArticleResponse } from "$lib/DBTypes";
    export let article: ArticleResponse;

</script>

<a href="/app/articles/{article.id}" class="block font-medium hover:text-violet-500">{article.name}</a>
<span class="text-sm block">{article.manufacturer}: {article.reference}</span>
<span class="text-sm block">{article.supplier}: {article.price} €</span>
{#if Number(article.quantity) > 0} <span class="text-sm text-emerald-600 block">{article.quantity} En stock.</span> {/if}