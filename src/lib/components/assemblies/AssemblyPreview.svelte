<script lang="ts">
    import { browser } from "$app/environment";

    import type { AssembliesResponse } from "$lib/DBTypes";
    import { VideoCameraSlash } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import Flex from "../layout/flex.svelte";

    export let assembly: AssembliesResponse;

</script>

<Flex items="center">

    {#if assembly.thumbnail !== "" && browser}
        <img src="http://{window.location.hostname}:8090/api/files/{assembly.collectionName}/{assembly.id}/{assembly.thumbnail}?thumb=200x200" alt={assembly.thumbnail} class="aspect-square object-cover h-10 rounded-md border border-zinc-500/50" />
    {:else}
        <div class="aspect-square object-cover h-10 rounded-md border border-zinc-500/50">
            <Icon src={VideoCameraSlash} class="h-5 w-5 m-2.5 text-red-500" />
        </div>
    {/if}

    <div>
        <a href="/app/assemblies/{assembly.id}" class="block">{assembly.name}</a>
    </div>
</Flex>
