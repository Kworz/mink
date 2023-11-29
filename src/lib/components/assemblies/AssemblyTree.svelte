<script lang="ts">

    import { Folder } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import AssemblyButton from "./AssemblyButton.svelte";
    import type { SCMAssemblyTree } from "./assemblyTree";

    export let assembly: SCMAssemblyTree;

    export let nestLevel = 20;
    export let last = false;

</script>

<div class="relative {nestLevel < 20 ? "mt-6" : ""}">

    <AssemblyButton zIndex={nestLevel} id={assembly.id} {last}>
        <Icon src={Folder} class="inline w-5 h-5 mr-2" />
        {assembly.name}
    </AssemblyButton>
    
    {#if assembly.subAssemblies.length > 0}
        {#if nestLevel < 20 && last}
            <div class="absolute w-0.5 -left-6 top-5 bottom-0 bg-zinc-900" />
        {/if}
        <div class="ml-12 flex flex-col items-start relative">
            <div class="absolute w-0.5 -left-6 -top-6 bottom-5 bg-zinc-400" />
            {#each assembly.subAssemblies as assemblyChild, i}
                <svelte:self assembly={assemblyChild} nestLevel={nestLevel - 1} last={assembly.subAssemblies.length - 1 === i}/>
            {/each}
        </div>
    {/if}
    
</div>
