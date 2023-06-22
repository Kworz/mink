<script lang="ts">
    import { itemsPosition, type FlexItemPosition } from "../layout/flexTypes";
    export let position: FlexItemPosition = "start";

</script>

<div class="p-4 border-t border-t-violet-500 font-semibold flex flex-col h-full justify-around transition-all duration-300 {itemsPosition[position]}">
    <slot />
</div>

