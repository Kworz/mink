<script lang="ts">
    import { itemsPosition, type FlexItemPosition } from "../layout/flexTypes";
    export let position: FlexItemPosition = "start";

</script>

<div class="p-4 border-b-violet-500/25 border-b-[1px] flex flex-col h-full justify-around transition-all duration-300 {itemsPosition[position]}">
    <slot />
</div>