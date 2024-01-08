<script lang="ts">
    import { itemsPosition, type FlexItemPosition } from "$lib/components/generics/layout/flex.svelte";
    import { colSpans, type columnAmount } from "$lib/components/generics/layout/grid.svelte";
    export let position: FlexItemPosition = "start";

    export let colspan: columnAmount = 1;

</script>

<div class="p-4 border-b-zinc-500/25 border-b-[1px] flex flex-col h-full justify-around transition-all duration-300 {itemsPosition[position]} {colSpans[colspan]} {$$props.class}">
    <slot />
</div>