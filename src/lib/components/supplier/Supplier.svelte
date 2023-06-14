<script lang="ts">
    import { browser } from "$app/environment";
    import type { SuppliersResponse } from "$lib/DBTypes";

    import { env } from "$env/dynamic/public";

    $: margin = supplier.thumbnail !== ""  ? "pl-1 pr-3" : "px-3";

    export let supplier: SuppliersResponse;
</script>

{#if browser}
    <a href={`/app/scm/articles?filter=${encodeURIComponent('supplier ~ "' + supplier.id + '"')}`} class="flex flex-row gap-2 items-center bg-white hover:bg-white/90 dark:bg-zinc-700 dark:hover:bg-zinc-700/80 duration-100 {margin} py-1 rounded-full border dark:border-zinc-800/50 w-fit">
        {#if supplier.thumbnail !== ""}
            <img src="http://{env.PUBLIC_POCKETBASE_ADDRESS}/api/files/{supplier.collectionName}/{supplier.id}/{supplier.thumbnail}?thumb=200x200" alt={supplier.name + " Logo"} class="h-6 w-6 rounded-full" />
        {/if}
        <span class="text-sm font-medium">{supplier.name}</span>
    </a>
{/if}
