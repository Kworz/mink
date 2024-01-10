<script lang="ts">
    import { Temporal } from "@js-temporal/polyfill";
    import { date as dateParser} from "svelte-i18n";

    export let date: Date | null;

    export let format: "long" | "medium" | "short" = "short";
    export let colorDate = false;

</script>

{#if date !== null}

    {@const datePosition = Temporal.PlainDate.compare(Temporal.Instant.from(date.toISOString()).toZonedDateTimeISO('UTC').toPlainDate(), Temporal.Now.zonedDateTimeISO('UTC').toPlainDate())}
    {@const isToday = datePosition === 0}
    {@const isPassed = datePosition === -1}
    {@const isFuture = datePosition === 1}
    
    <span
        class:text-red-500={colorDate && isPassed}
        class:text-emerald-500={colorDate && isFuture}
        class:text-amber-500={colorDate && isToday}
        class:font-medium={colorDate && (isPassed || isToday)}
    >
        {$dateParser(typeof date === "string" ? new Date(date) : date, { format: format})}
    </span>
{:else}
    Date Inconnue
{/if}