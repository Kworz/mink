<script lang="ts">
    import type { scm_store } from "@prisma/client";
    import { _ } from "svelte-i18n";

    export let store: scm_store | undefined;
</script>

<span class="bg-zinc-900 hover:bg-zinc-900/80 ring-1 ring-zinc-400/25 duration-100 py-1 px-2 rounded-full text-xs w-max">
    {#if store === undefined}
        {$_('app.generic.unknown')}
    {:else}
        <span class="font-semibold">{store.name}</span> / {store.location || $_('app.generic.unknown')}
    {/if}
</span>