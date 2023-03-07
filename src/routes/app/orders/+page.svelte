<script lang="ts">

    import Flex from "$lib/components/layout/flex.svelte";
    import { OrdersStateOptions } from "$lib/DBTypes";
    import type { PageData } from "./$types";
    import OrderTable from "./OrderTable.svelte";
    export let data: PageData;

    let showCompletedOrders = false;

    $: orders = (showCompletedOrders) ? data.orders : data.orders.filter(k => k.state !== OrdersStateOptions.completed);

</script>

<h2>Commandes</h2>
<p>Liste des commandes</p>

<Flex items="center" gap={2}>
    <input type="checkbox" bind:checked={showCompletedOrders}/>
    <span>Afficher les commandes terminées</span>
</Flex>

<OrderTable bind:orders />