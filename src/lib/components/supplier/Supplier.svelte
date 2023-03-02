<script lang="ts">
    import { browser } from "$app/environment";
    import type { SuppliersResponse } from "$lib/DBTypes";

    $: margin = supplier.thumbnail !== undefined  ? "pl-1 pr-3" : "px-3";

    export let supplier: SuppliersResponse;
</script>

{#if browser}
    <div class="flex flex-row gap-2 items-center bg-white {margin} py-1 rounded-full ring-1 ring-zinc-300">
        {#if supplier.thumbnail}
            <img src="http://{window.location.hostname}:8090/api/files/{supplier.collectionName}/{supplier.id}/{supplier.thumbnail}?thumb=200x200" alt={supplier.name + " Logo"} class="h-6 w-6 rounded-full" />
        {/if}
        <div>{supplier.name}</div>
    </div>
{/if}
