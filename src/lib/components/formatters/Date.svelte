<script lang="ts">
    import { Temporal } from "@js-temporal/polyfill";
    export let date: string | undefined;

    export let format: "long" | "medium" | "short" = "short";

</script>

{#if date !== undefined && date !== ""}
    {#if format === "short"}
        {Temporal.Instant.from(date).toZonedDateTimeISO('UTC').toPlainDate().toString()}
    {:else}
        {Intl.DateTimeFormat("fr", { dateStyle: format}).format(Date.parse(date))}
    {/if}
{:else}
    {date}
{/if}