<script lang="ts">
    import { browser } from "$app/environment";
    import { env } from "$env/dynamic/public";
    import type { scm_supplier } from "@prisma/client";

    $: margin = supplier.logo !== null  ? "pl-1 pr-3" : "px-3";

    export let supplier: scm_supplier;
</script>

{#if browser}
    <a href={`/app/scm/articles?filter=${encodeURIComponent('supplier ~ "' + supplier.id + '"')}`} class="flex flex-row gap-2 items-center bg-zinc-900 hover:bg-zinc-900/80 duration-100 {margin} py-1 rounded-full ring-1 ring-zinc-400/25 w-fit">
        {#if supplier.logo !== null}
            <img src="https://{env.PUBLIC_AWS_BUCKET_NAME}.s3.{env.PUBLIC_AWS_REGION}.amazonaws.com/scm/supplier/{supplier.id}/{supplier.logo}" alt={supplier.name + " Logo"} class="h-6 w-6 rounded-full" />
        {/if}
        <span class="text-sm font-medium">{supplier.name}</span>
    </a>
{/if}
