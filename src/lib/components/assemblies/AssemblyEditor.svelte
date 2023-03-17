<script lang="ts">

    import Flex from "../layout/flex.svelte";
    import { getAssemblyContext } from "./assemblyContext";
    const { selectedAssembly } = getAssemblyContext();

</script>

{#if $selectedAssembly !== undefined}
    <Flex direction="col">
        <h3>{$selectedAssembly.name}</h3>

        

    </Flex>
{/if}
