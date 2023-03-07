<script lang="ts">
    import { browser } from "$app/environment";
    import type { SuppliersResponse } from "$lib/DBTypes";

    $: margin = supplier.thumbnail !== ""  ? "pl-1 pr-3" : "px-3";

    export let supplier: SuppliersResponse;
</script>

{#if browser}
    <a href={supplier.website ?? "#"} class="flex flex-row gap-2 items-center bg-white hover:bg-white/75 duration-100 {margin} py-1 rounded-full ring-1 ring-zinc-300 w-fit">
        {#if supplier.thumbnail !== ""}
            <img src="http://{window.location.hostname}:8090/api/files/{supplier.collectionName}/{supplier.id}/{supplier.thumbnail}?thumb=200x200" alt={supplier.name + " Logo"} class="h-6 w-6 rounded-full" />
        {/if}
        <span class="text-sm font-medium">{supplier.name}</span>
    </a>
{/if}
