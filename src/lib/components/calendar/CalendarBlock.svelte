<script lang="ts">

    import { getCalendarContext } from "./calendarContext";
    import { Temporal } from "@js-temporal/polyfill";
    import CalendarEvent from "./CalendarEvent.svelte";

    export let date: Temporal.PlainDate;
    export let todayDate: Temporal.PlainDate;
    export let borderSides = [true, true, true, true];

    const { currentMonth, calendarEvents } = getCalendarContext();

    $: events = $calendarEvents.filter(k => Temporal.PlainDate.compare(k.startDate, date) !== 1 && Temporal.PlainDate.compare(k.endDate, date) !== -1);

</script>

<div 
    class="calendarBlock relative"
    class:border-t={borderSides[0] === true}
    class:border-r={borderSides[1] === true}
    class:border-b={borderSides[2] === true}
    class:border-l={borderSides[3] === true}
    class:current={Temporal.PlainDate.compare(date, todayDate) === 0}
    class:old={Temporal.PlainDate.compare(date, todayDate) < 0}
    class:masked={date.month !== $currentMonth}
>
    <span class="absolute top-4 left-4 text-5xl font-bold">{date.day}</span>

    <div class="bottom-0 left-0 right-0 absolute flex flex-col gap-0">
        {#each events as event}
            <CalendarEvent 
                bind:event 
                hasEventOnSides={[
                    Temporal.PlainDate.compare(event.startDate, date) === -1, 
                    Temporal.PlainDate.compare(event.endDate, date) !== 0
                ]} 
                firstOfRow={date.dayOfWeek === 1 || Temporal.PlainDate.compare(event.startDate, date) === 0}
            />
        {/each}
    </div>
</div>

<style>
    .calendarBlock {
        aspect-ratio: 1 / 1;
        @apply bg-zinc-100 text-zinc-800/30 border-zinc-500/50 p-2;
    }

    .current {
        @apply bg-violet-200;
    }

    .masked {
        @apply bg-red-50 text-zinc-800/10;
    }

    .old {
        @apply grayscale text-zinc-800/10;
    }
</style>