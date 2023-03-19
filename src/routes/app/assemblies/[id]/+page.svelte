<script lang="ts">
    import { getAssemblyContext, setAssemblyContext } from "$lib/components/assemblies/assemblyContext";
    import AssemblyEditor from "$lib/components/assemblies/AssemblyEditor.svelte";
    import AssemblyTree from "$lib/components/assemblies/AssemblyTree.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import Wrapper2 from "$lib/components/Wrapper2.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;

    setAssemblyContext(data.assembly);

</script>

<Wrapper>
    <h3>Visualisation de l'assemblage {data.assembly.name}.</h3>
</Wrapper>

<Flex gap={6} class="mt-6" items="start">
    <Wrapper2 class="w-fit shrink-0">
        {#key data.assembly.id}
            <AssemblyTree bind:assembly={data.assembly} />
            <!--<AssemblyViewer bind:assembly={data.assembly} />-->
        {/key}
    </Wrapper2>

    <AssemblyEditor />
</Flex>
