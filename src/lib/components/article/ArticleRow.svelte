<script lang="ts">

    import type { ArticleResponse } from "$lib/DBTypes";
    export let article: ArticleResponse;

</script>

<a href="/app/articles/{article.id}" class="block font-medium hover:text-violet-500">{article.name}</a>
<span class="text-sm block">{article.manufacturer}: {article.reference}</span>
<span class="text-sm">{article.supplier}: {article.price} €</span>