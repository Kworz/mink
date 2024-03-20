<script lang="ts">
    import Filter from "$lib/components/derived/filter/Filter.svelte";
    import Button from "$lib/components/generics/Button.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import type { scm_assembly } from "@prisma/client";
    import type { PrismaFilter } from "../filter/filter";
    import AssemblyPreview2 from "./AssemblyPreview2.svelte";

    export let filter: PrismaFilter;
    
    export let assemblies: scm_assembly[];
    export let selectedAssembly: scm_assembly | undefined = undefined;

    export let formFieldName: string | undefined = undefined;

</script>

<Flex direction="col" items="start" gap={4} class="w-full">
    {#if selectedAssembly === undefined}
        <Flex gap={6} wrap={"nowrap"} class="w-full overflow-x-scroll snap-x">
            {#each assemblies as assembly (assembly.id)}
                <button on:click|preventDefault={() => { selectedAssembly = assembly }} class="aspect-[8] snap-start snap-mandatory text-left hover:bg-zinc-600/25 duration-300 rounded-md p-4 ring-1 ring-inset ring-zinc-400/25">
                    <AssemblyPreview2 bind:assembly />
                </button>
            {/each}
        </Flex>
        <Filter class="w-full" bind:filter availableFilters={[
            { name: "name", default: true, type: "string" },
            { name: "reference", type: "string" },
            { name: "brand", type: "string" }
        ]} />
    {:else}
        <div class="aspect-[8] text-left rounded-md p-4 ring-1 ring-inset ring-zinc-400/25">
            <AssemblyPreview2 bind:assembly={selectedAssembly} />
        </div>
        {#if formFieldName !== undefined} <input type="hidden" name={formFieldName} bind:value={selectedAssembly.id} /> {/if}
        <Button size="small" role="danger" preventSend on:click={() => selectedAssembly = undefined}>Déselectionner</Button>
    {/if}
</Flex>

