<script lang="ts">
    import { _ } from "svelte-i18n";


    import type { PropsPrismaFilter } from "./filter";
    export let filter: PropsPrismaFilter;

    $: filterMainKey = Object.keys(filter)[0];
    $: filterOperand = Object.keys(filter[filterMainKey])[0];
    $: filterValue = filter[filterMainKey][filterOperand];

</script>

<div class="text-xs font-medium rounded-full bg-zinc-300 text-zinc-900 py-0.5 px-2">
    <span>{filterMainKey}</span>
    <span class="font-bold">{$_('app.filter.operands.' + filterOperand)}</span>
    <span>{filterValue}</span>
</div>