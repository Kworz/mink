<script lang="ts">
    import { setAssemblyContext } from "$lib/components/assemblies/assemblyContext";
    import AssemblyEditor from "$lib/components/assemblies/AssemblyEditor.svelte";
    import AssemblyFlat from "$lib/components/assemblies/AssemblyFlat.svelte";
    import AssemblyTree from "$lib/components/assemblies/AssemblyTree.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import Wrapper2 from "$lib/components/Wrapper2.svelte";
    import { DocumentCheck } from "@steeze-ui/heroicons";
    import type { PageData } from "./$types";

    export let data: PageData;

    let mode: "nested" | "flat" = "nested";

    setAssemblyContext(data.assembly);

</script>

<Wrapper>
    <h3>Visualisation de l'assemblage {data.assembly.name}.</h3>

    <PillMenu>
        <PillMenuButton icon={DocumentCheck} on:click={() => mode = (mode === "nested") ? "flat" : "nested"}>{mode === "nested" ? "Vue applanie" : "Vue imbriquée"}</PillMenuButton>
    </PillMenu>
</Wrapper>

{#if mode === "nested"}
    <Flex gap={6} class="mt-6" items="start">
        <Wrapper2 class="w-fit shrink-0">
            {#key data.assembly.id}
                <AssemblyTree bind:assembly={data.assembly} />
            {/key}
        </Wrapper2>
    
        <AssemblyEditor />
    </Flex>
{:else}
    <AssemblyFlat bind:assembly={data.assembly} />
{/if}

