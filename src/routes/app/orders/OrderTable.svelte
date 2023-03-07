<script lang="ts">
    import Price from "$lib/components/formatters/Price.svelte";
    import Supplier from "$lib/components/supplier/Supplier.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import User from "$lib/components/user/User.svelte";
    import type { OrdersResponseExpanded } from "./+page.server";
    import OrderState from "./OrderState.svelte";

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
                <TableCell><a href="/app/orders/{order.id}" class="hover:text-violet-500 duration-100 font-semibold">{order.name}</a></TableCell>
                <TableCell><Supplier supplier={order.expand?.supplier} /></TableCell>
                <TableCell>
                    <Price 
                        value={order.expand?.["orders_rows(order)"]?.map(k => {
                            return (k.expand?.article.price ?? 0) * k.quantity
                        }).reduce((p, c) => c = p + c, 0) ?? 0}
                    >
                    </Price>
                </TableCell>
                <TableCell><OrderState state={order.state} /></TableCell>
                <TableCell><User user={order?.expand?.issuer}/></TableCell>
            </TableRow>
        {/each}
    </svelte:fragment>
</Table>