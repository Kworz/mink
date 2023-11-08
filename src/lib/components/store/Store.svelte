<script lang="ts">
    import type { SCMStore } from "@prisma/client";


    export let store: SCMStore | undefined;

</script>

<span class="bg-white hover:bg-white/90 dark:bg-zinc-700 dark:hover:bg-zinc-700/80 duration-100 py-1 px-2 rounded-full border dark:border-zinc-800/50 text-xs">
    {#if store === undefined}
        Inconnu
    {:else}
        <span class="font-semibold">{store.name}</span> / {store.location}
    {/if}
</span>