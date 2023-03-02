<script lang="ts">
    import { browser } from "$app/environment";
    import type { SuppliersResponse } from "$lib/DBTypes";

    export let supplier: SuppliersResponse;
</script>

{#if browser}
    <div class="flex flex-row gap-2 items-center bg-white px-2 py-1 rounded-full ring ring-zinc-100">
        {#if supplier.thumbnail}
            <img src="http://{window.location.hostname}:8090/api/files/{supplier.collectionName}/{supplier.id}/{supplier.thumbnail}?thumb=200x200" alt={supplier.name + " Logo"} class="h-6 w-6 rounded-full border border-zinc-100/50"/>
        {/if}
        <div>{supplier.name}</div>
    </div>
{/if}
