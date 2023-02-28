<script lang="ts">
    import { Temporal } from "@js-temporal/polyfill";
    export let date: string | undefined;

</script>

{#if date !== undefined && date !== ""}
    {Temporal.Instant.from(date).toZonedDateTimeISO('UTC').toPlainDate().toString()}
{:else}
    {date}
{/if}