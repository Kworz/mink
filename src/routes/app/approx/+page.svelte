<script lang="ts">
    import { browser } from "$app/environment";
    import { invalidateAll } from "$app/navigation";
    import Date from "$lib/components/formatters/Date.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import type { ActionData, PageData } from "./$types";
    import ApproxTable from "./ApproxTable.svelte";

    export let data: PageData;
    export let form: ActionData;

    let splitView: "supplier" | "ack_date" = "supplier";

    $: suppliers = [... new Set(data.order_rows.map(k => k.expand?.order.supplier))];
    $: dates = [... new Set(data.order_rows.map(k => k.ack_date))];

    $: suppliersSplittedRows = suppliers.map(k => { return { supplier: k, rows: data.order_rows.filter(j => j.expand?.order.expand?.supplier.id === k)}});
    $: datesSplittedRows = dates.map(k => { return { date: k, rows: data.order_rows.filter(j => j.ack_date === k)}});

    $: if(form !== undefined && browser) { invalidateAll(); }

</script>
<h2>Approvisionement</h2>
<p>Articles en attente de réception.</p>

<Flex gap={2}>
    <input type="radio" bind:group={splitView} value="supplier" />
    <span>Tri par fournisseur</span>
</Flex>

<Flex gap={2} class="mb-6">
    <input type="radio" bind:group={splitView} value="ack_dates" />
    <span>Tri par date d'arrivée</span>
</Flex>


{#if splitView === "supplier"}
    {#each suppliersSplittedRows as orderRows}
        <h3 class="mb-4 mt-6">{orderRows.supplier}</h3>
        <ApproxTable orderRows={orderRows.rows} lists={data.lists} />
    {/each}
{:else}
    {#each datesSplittedRows as orderRows}
        <h3 class="mb-4 mt-6"><Date date={orderRows.date} format="long"/></h3>
        <ApproxTable orderRows={orderRows.rows} lists={data.lists} />
    {/each}
{/if}

