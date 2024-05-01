<script lang="ts">
    import { browser } from "$app/environment";
    import type { scm_supplier } from "@prisma/client";

    export let supplier: scm_supplier;
    
    $: margin = supplier.logo !== null  ? "pl-1 pr-3" : "px-3";

</script>

{#if browser}
    <span class="flex flex-row gap-2 items-center bg-zinc-900 hover:bg-zinc-900/80 duration-100 {margin} py-1 rounded-full ring-1 ring-zinc-400/25 w-max">
        {#if supplier.logo !== null}
            <img src="/api/file/scm/supplier/{supplier.id}/{supplier.logo}" alt={supplier.name + " Logo"} class="h-6 w-6 rounded-full" />
        {/if}
        <span class="text-sm font-medium text-nowrap">{supplier.name}</span>
    </span>
{/if}
