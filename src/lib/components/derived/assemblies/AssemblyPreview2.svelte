<script lang="ts">
    import { browser } from "$app/environment";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import type { scm_assembly } from "@prisma/client";
    import { VideoCameraSlash } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { _ } from "svelte-i18n";


    export let assembly: scm_assembly;

    export let displayThumb = true;

</script>



<a href="/app/scm/assemblies/{assembly.id}">
    <Flex items="center">
    
        {#if displayThumb === true && assembly.thumbnail && browser}
            <img src={assembly.thumbnail} alt={$_('scm.assembly.thumbnail', { values: { name: assembly.name }})} class="aspect-square object-cover h-20 rounded-md border border-zinc-500/50" />
        {:else}
            <div class="aspect-square object-cover h-20 rounded-md border border-zinc-500/50">
                <Icon src={VideoCameraSlash} class="h-10 w-10 m-5 text-red-500" />
            </div>
        {/if}

        <div>
            <p>{assembly.name}</p>
            <p class="text-zinc-500 text-base font-normal">{assembly.description || $_('app.generic.decription_null')}</p>
        </div>
    </Flex>
</a>