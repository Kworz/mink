<script lang="ts">
    import { browser } from "$app/environment";
    import type { SCMSupplier } from "@prisma/client";

    $: margin = supplier.logo !== null  ? "pl-1 pr-3" : "px-3";

    export let supplier: SCMSupplier;
</script>

{#if browser}
    <a href={`/app/scm/articles?filter=${encodeURIComponent('supplier ~ "' + supplier.id + '"')}`} class="flex flex-row gap-2 items-center bg-white hover:bg-white/90 dark:bg-zinc-700 dark:hover:bg-zinc-700/80 duration-100 {margin} py-1 rounded-full border dark:border-zinc-800/50 w-fit">
        {#if supplier.logo !== null}
            <img src={supplier.logo} alt={supplier.name + " Logo"} class="h-6 w-6 rounded-full" />
        {/if}
        <span class="text-sm font-medium">{supplier.name}</span>
    </a>
{/if}
