<script lang="ts">

    import type { CalendarElementType } from "./calendarTypes";
    export let event: CalendarElementType;

</script>


<button class="flex flex-row items-center gap-2 bg-zinc-300 border border-zinc-500/50 rounded-sm py-0.5 px-2 w-full">
    <div class="h-2 w-2 rounded-full {event.color}" />
    <span class="text-zinc-800">{event.name}</span>
</button>