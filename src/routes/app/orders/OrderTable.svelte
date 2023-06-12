<script lang="ts">
    import Price from "$lib/components/formatters/Price.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
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
        <TableHead>Montant (TTC)</TableHead>
        <TableHead>État</TableHead>
        <TableHead>Demandeur</TableHead>
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#each orders as order}
            <TableRow>
                <TableCell>
                    <a href="/app/orders/{order.id}">
                        <Flex direction="col" gap={1}>
                            <span>{order.name}</span>
                            <span class="text-sm text-zinc-500">{order.sub_id}</span>
                        </Flex>
                    </a>
                </TableCell>
                <TableCell><Supplier supplier={order.expand?.supplier} /></TableCell>
                <TableCell><Price value={order.expand?.["orders_total_price(order_ref)"]?.at(0)?.gross_price ?? 0} /></TableCell>
                <TableCell><Price value={order.expand?.["orders_total_price(order_ref)"]?.at(0)?.net_price ?? 0} /></TableCell>
                <TableCell><OrderState state={order.state} /></TableCell>
                <TableCell><User user={order?.expand?.issuer}/></TableCell>
            </TableRow>
        {/each}
    </svelte:fragment>
</Table>