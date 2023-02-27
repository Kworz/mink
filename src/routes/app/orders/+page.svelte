<script lang="ts">

    import type { PageData } from "./$types";
    import OrderTable from "./OrderTable.svelte";
    export let data: PageData;

</script>

<h2>Commandes</h2>
<p>Liste des commandes</p>

<OrderTable bind:orders={data.orders} />