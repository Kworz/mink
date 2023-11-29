<script lang="ts">
    
    import Flex from "../layout/flex.svelte";
    import { VideoCameraSlash } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";

    import type { SCMAssembly } from "@prisma/client";

    export let assembly: SCMAssembly;
    export let minimized = false;
    export let imageSize = "h-10 hover:h-20";

</script>

<a href="/app/scm/assemblies/{assembly.id}">
    <Flex items="center">
    
        {#if assembly.thumbnail !== null}
            <img src="{assembly.thumbnail}" alt={assembly.thumbnail} class="aspect-square object-cover {imageSize} duration-100 rounded-md border border-zinc-500/50" />
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

