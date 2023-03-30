<script lang="ts">
    
    import Flex from "../layout/flex.svelte";
    import SortButton from "./SortButton.svelte";
    
    export let colWidth: string | undefined = undefined;
    export let col: string | undefined = undefined;
    export let activeSort: string | undefined = undefined;

</script>

<th class="{colWidth} p-4 border-b-2 border-b-violet-500/75 text-left {$$props.class}">
    <Flex items="center" gap={1}>
        <span><slot /></span>
        {#if col !== undefined}
            <SortButton direction="asc" active={col === activeSort} on:click={() => activeSort = col ?? ""} />
            <SortButton direction="desc" active={`-${col}` === activeSort} on:click={() => activeSort = `-${col}`} />
        {/if}
    </Flex>
</th>
