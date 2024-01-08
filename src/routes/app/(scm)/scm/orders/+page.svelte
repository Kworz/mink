<script lang="ts">
    import { enhance } from "$app/forms";
    import { DocumentCheck, PlusCircle } from "@steeze-ui/heroicons";
    import type { PageData } from "./$types";

    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte"; 
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import Supplier from "$lib/components/supplier/Supplier.svelte";
    import Price from "$lib/components/formatters/Price.svelte";
    import OrderState from "./OrderState.svelte";
    import User from "$lib/components/user/User.svelte";
    import Modal from "$lib/components/modal/Modal.svelte";

    export let data: PageData;

    let showCompletedOrders = false;
    let showCancelledOrders = false;
    let createOrder = false;

    $: orders = data.orders.filter(k => {

        let result = true;

        if(!showCancelledOrders)
            result = result && k.state !== OrdersStateOptions.cancelled;
        
        if(!showCompletedOrders)
            result = result && k.state !== OrdersStateOptions.completed;
        
        return result;
    });

</script>

{#if createOrder}
    <Modal title="Créer une nouvelle commande" on:close={() => createOrder = false }>
        <form action="?/createOrder" method="post" use:enhance class="grid grid-cols-1 gap-4">
            <FormInput name="name" label="Nom de commande" labelMandatory={true} />
            <FormInput type="select" name="supplier_id" label="Fournisseur" labelMandatory={true}>
                {#each data.suppliers as supplier}
                    <option value={supplier.id}>{supplier.name}</option>
                {/each}
            </FormInput>
            <Button>Créer la commande</Button>
        </form>
    </Modal>
{/if}

<h1>Commandes</h1>
<p>Commandes en cours.</p>

<PillMenu>
    <PillMenuButton icon={PlusCircle} click={() => createOrder = !createOrder }>Créer une commande</PillMenuButton>
    <PillMenuButton icon={DocumentFragment} click={() => { showCancelledOrders = !showCancelledOrders; return true; }}>{showCancelledOrders ? "Masquer" : "Afficher"} les commandes annulées</PillMenuButton>
    <PillMenuButton icon={DocumentCheck} click={() => { showCompletedOrders = !showCompletedOrders; return true; }}>{showCompletedOrders ? "Masquer" : "Afficher"} les commandes terminées</PillMenuButton>
</PillMenu>

<Table headers={[{label: "Numéro de commande"}, {label: "Fournisseur"}, {label: "Montant (HT)"}, {label: "Montant (TTC)"}, {label: "État"}, {label: "Demandeur"}]} class="mt-6">
        
    {#each orders as order}
        <TableCell>
            <a href="/app/scm/orders/{order.id}">
                <Flex direction="col" gap={1}>
                    <span>{order.name}</span>
                    <span class="text-sm text-zinc-200">{order.sub_id}</span>
                </Flex>
            </a>
        </TableCell>
        <TableCell><Supplier supplier={order.supplier} /></TableCell>
        <TableCell><Price value={order.expand?.["orders_total_price(order_ref)"]?.at(0)?.gross_price ?? 0} /></TableCell>
        <TableCell><Price value={order.expand?.["orders_total_price(order_ref)"]?.at(0)?.net_price ?? 0} /></TableCell>
        <TableCell><OrderState state={order.state} /></TableCell>
        <TableCell><User user={order.issuer} /></TableCell>
    {/each}
</Table>