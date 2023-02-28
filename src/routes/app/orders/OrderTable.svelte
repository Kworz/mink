<script lang="ts">
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import User from "$lib/components/user/User.svelte";
    import type { OrdersResponseExpanded } from "./+page.server";

    export let orders: Array<OrdersResponseExpanded>;
</script>

<Table>
    <svelte:fragment slot="head">
        <TableHead>Numéro de commande</TableHead>
        <TableHead>Fournisseur</TableHead>
        <TableHead>Montant (HT)</TableHead>
        <TableHead>État</TableHead>
        <TableHead>Demandeur</TableHead>
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#each orders as order}
            <TableRow>
                <TableCell><a href="/app/orders/{order.id}" class="hover:text-violet-500 duration-100 font-medium">{order.name}</a></TableCell>
                <TableCell>{order.expand?.supplier?.name}</TableCell>
                <TableCell>
                    {order.expand?.["orders_rows(order)"].map(k => {
                        return (k.expand?.article.price ?? 0) * k.quantity
                    }).reduce((p, c) => c = p + c, 0)} €
                </TableCell>
                <TableCell>{order.state}</TableCell>
                <TableCell><User user={order?.expand?.issuer}/></TableCell>
            </TableRow>
        {/each}
    </svelte:fragment>
</Table>