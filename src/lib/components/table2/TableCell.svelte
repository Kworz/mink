<script lang="ts">
    import { itemsPosition, type FlexItemPosition } from "../layout/flexTypes";
    import { colSpans, type colSpan } from "../layout/gridTypes";
    export let position: FlexItemPosition = "start";

    export let colspan: colSpan = 1;

</script>

<div class="p-4 border-b-violet-500/25 border-b-[1px] flex flex-col h-full justify-around transition-all duration-300 {itemsPosition[position]} {colSpans[colspan]}">
    <slot />
</div>