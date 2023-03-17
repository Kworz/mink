<script lang="ts">

    import type { ArticleStoresResponse } from "$lib/DBTypes";
    export let store: ArticleStoresResponse;

</script>

<span class="bg-white hover:bg-white/90 dark:bg-zinc-700 dark:hover:bg-zinc-700/80 duration-100 py-1 px-2 rounded-full border dark:border-zinc-800/50 text-xs">
    <span class="font-semibold">{store.name}</span> / {store.location}
</span>