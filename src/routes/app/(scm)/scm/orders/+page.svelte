<script lang="ts">
    import { enhance } from "$app/forms";
    import Supplier from "$lib/components/derived/supplier/Supplier.svelte";
    import User from "$lib/components/derived/user/User.svelte";
    import Button from "$lib/components/generics/Button.svelte";
    import Price from "$lib/components/generics/formatters/Price.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import { DocumentCheck, DocumentMinus, PlusCircle } from "@steeze-ui/heroicons";
    import type { PageData } from "./$types";
    import OrderState from "./OrderState.svelte";
    import EmptyData from "$lib/components/EmptyData.svelte";
    import MenuSide from "$lib/components/generics/menu/MenuSide.svelte";
    import { page } from "$app/stores";
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";

    export let data: PageData;

    let createOrder = false;

    let showCompletedOrders = $page.url.searchParams.get("show_completed") === "true";
    let showCancelledOrders = $page.url.searchParams.get("show_cancelled") === "true";

    $: showCancelledOrders, showCompletedOrders, refresh();

    const refresh = () => { 
        if(browser) return; 
        goto(`?show_completed=${showCompletedOrders}&show_cancelled=${showCancelledOrders}`);
    };

</script>

{#if createOrder}
    <MenuSide title="Créer une nouvelle commande" on:close={() => createOrder = false }>
        <form action="?/createOrder" method="post" use:enhance class="grid grid-cols-1 gap-4">
            <FormInput name="name" label="Nom de commande" labelMandatory={true} />
            <FormInput type="select" name="supplier_id" label="Fournisseur" labelMandatory={true}>
                {#each data.suppliers as supplier}
                    <option value={supplier.id}>{supplier.name}</option>
                {/each}
            </FormInput>
            <Button>Créer la commande</Button>
        </form>
    </MenuSide>
{/if}

<h1>Commandes</h1>
<p>Commandes en cours.</p>

<PillMenu>
    <PillMenuButton icon={PlusCircle} click={() => createOrder = !createOrder }>Créer une commande</PillMenuButton>
    <PillMenuButton icon={DocumentMinus} click={() => { showCancelledOrders = !showCancelledOrders; return true; }}>{showCancelledOrders ? "Masquer" : "Afficher"} les commandes annulées</PillMenuButton>
    <PillMenuButton icon={DocumentCheck} click={() => { showCompletedOrders = !showCompletedOrders; return true; }}>{showCompletedOrders ? "Masquer" : "Afficher"} les commandes terminées</PillMenuButton>
</PillMenu>

{#if data.orders.length > 0}
    <Table headers={[{label: "Numéro de commande"}, {label: "Fournisseur"}, {label: "Montant (HT)"}, {label: "Montant (TTC)"}, {label: "État"}, {label: "Demandeur"}]} class="mt-6">
            
        {#each data.orders as order}
            {@const orderGrossPrice = order.order_rows.reduce((p, c) => p = p + c.needed_quantity * (c.ack_price ?? 0), 0)}
            <TableCell>
                <a href="/app/scm/orders/{order.id}">
                    <Flex direction="col" gap={1}>
                        <span>{order.name}</span>
                        <span class="text-sm text-zinc-200">{order.sub_id}</span>
                    </Flex>
                </a>
            </TableCell>
            <TableCell><Supplier supplier={order.supplier} /></TableCell>
            
            <TableCell><Price value={orderGrossPrice} /></TableCell>
            <TableCell><Price value={orderGrossPrice * (1 + (order.vat / 100))} /></TableCell>
            <TableCell><OrderState state={order.state} /></TableCell>
            <TableCell><User user={order.issuer} /></TableCell>
        {/each}
    </Table>
{:else}
    <EmptyData on:click={() => createOrder = true } />
{/if}