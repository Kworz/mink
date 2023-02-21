<script lang="ts">

    import type { CalendarElementType } from "./calendarTypes";
    export let event: CalendarElementType;

    export let hasEventOnSides = [false, false];
    export let firstOfRow = true;

</script>

<button
    class="flex flex-row items-center gap-2 bg-zinc-300 border-zinc-500/50 border-y py-0.5 px-2 m-2 mt-1"
    class:ml-0={hasEventOnSides[0]}
    class:rounded-l-full={!hasEventOnSides[0]}
    class:border-l={!hasEventOnSides[0]}
    class:mr-0={hasEventOnSides[1]}
    class:rounded-r-full={!hasEventOnSides[1]}
    class:border-r={!hasEventOnSides[1]}
>
    {#if firstOfRow}
        <div class="h-2 w-2 rounded-full {event.color}" />
        <span class="text-zinc-800">{event.name}</span>
        {:else}
            <span class="text-transparent invisible">{event.name}</span>
    {/if}
</button>