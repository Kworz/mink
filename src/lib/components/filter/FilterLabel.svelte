<script lang="ts">
    
    import { XMark } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import type { FilterCondition } from "./filter2"
    ;
    export let filter: FilterCondition;

</script>

<div class="py-0.5 pr-1 pl-2 text-xs rounded-full bg-white dark:bg-zinc-800 border dark:border-zinc-700 flex flex-row items-center gap-1">
    <span>{filter.field} {filter.operator} {filter.value}</span>
    <button on:click>
        <Icon src={XMark} class="h-4 w-4 text-red-500 hover:text-red-500/75 duration-100" />
    </button>
</div>