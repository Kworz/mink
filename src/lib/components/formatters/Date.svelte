<script lang="ts">
    import { Temporal } from "@js-temporal/polyfill";

    export let date: string | undefined;

    export let format: "long" | "medium" | "short" = "short";
    export let colorDate = false;

</script>

{#if date !== undefined && date !== ""}
    {@const datePosition = Temporal.PlainDate.compare(Temporal.Instant.from(date).toZonedDateTimeISO('UTC').toPlainDate(), Temporal.Now.zonedDateTimeISO('UTC').toPlainDate())}
    {@const isToday = datePosition === 0}
    {@const isPassed = datePosition === -1}
    {@const isFuture = datePosition === 1}
    
    <span
        class:text-red-500={colorDate && isPassed}
        class:text-emerald-500={colorDate && isFuture}
        class:text-amber-500={colorDate && isToday}
        class:font-medium={colorDate && (isPassed || isToday)}
    >
        {#if format === "short"}
            {Temporal.Instant.from(date).toZonedDateTimeISO('UTC').toPlainDate().toString()}
        {:else}
            {Intl.DateTimeFormat("fr", { dateStyle: format}).format(Date.parse(date))}
        {/if}
    </span>
{:else}
    Date Inconnue
{/if}