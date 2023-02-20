<script lang="ts">
    
    import Flex from "../layout/flex.svelte";
    import SortButton from "./SortButton.svelte";

    export let col: string;
    export let activeSort: string;
    export let sortFn: (value: string) => void

</script>

<th class="p-4 border-b border-b-violet-500/75 text-left">
    <Flex items="center" gap={1}>
        <span><slot /></span>
        <SortButton direction="asc" active={col === activeSort} on:click={() => sortFn(col)} />
        <SortButton direction="desc" active={`-${col}` === activeSort} on:click={() => sortFn(`-${col}`)} />
    </Flex>
</th>
