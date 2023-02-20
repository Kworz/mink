<script lang="ts">

    import Calendar from "$lib/components/calendar/Calendar.svelte";

    import type { PageData } from "./$types";
    export let data: PageData;

</script>

<svelte:head><title>Nomenclaturize — Planning</title></svelte:head>

<Calendar events={data.calendarEvents}/>
