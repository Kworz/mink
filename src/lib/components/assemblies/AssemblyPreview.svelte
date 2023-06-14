<script lang="ts">
    import { browser } from "$app/environment";

    import type { AssembliesResponse } from "$lib/DBTypes";
    import { VideoCameraSlash } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import Flex from "../layout/flex.svelte";

    import { env } from "$env/dynamic/public";

    export let assembly: AssembliesResponse;
    export let minimized = false;
    export let imageSize = "h-10 hover:h-20";

</script>

<a href="/app/scm/assemblies/{assembly.id}">
    <Flex items="center">
    
        {#if assembly.thumbnail !== "" && browser}
            <img src="http://{env.PUBLIC_POCKETBASE_ADDRESS}/api/files/{assembly.collectionName}/{assembly.id}/{assembly.thumbnail}?thumb=200x200" alt={assembly.thumbnail} class="aspect-square object-cover {imageSize} duration-100 rounded-md border border-zinc-500/50" />
        {:else}
            <div class="aspect-square object-cover {imageSize} rounded-md border border-zinc-500/50">
                <Icon src={VideoCameraSlash} class="h-full w-5 m-auto text-red-500" />
            </div>
        {/if}
    
        {#if minimized === false}
            <span>
                {assembly.name}            
            </span>
        {/if}
    
    </Flex>
</a>    

