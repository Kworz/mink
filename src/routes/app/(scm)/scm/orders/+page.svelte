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
    import { _ } from "svelte-i18n";

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

<svelte:head>
    <title>{$_('app.generic.orders')} — mink</title>
</svelte:head>

{#if createOrder}
    <MenuSide title={$_('scm.orders.actions.create.title')} on:close={() => createOrder = false }>
        <form action="?/createOrder" method="post" use:enhance class="grid grid-cols-1 gap-4">
            <FormInput name="name" label={$_('app.generic.order_name')} labelMandatory={true} />
            <FormInput type="select" name="supplier_id" label={$_('app.generic.supplier')} labelMandatory={true}>
                {#each data.suppliers as supplier}
                    <option value={supplier.id}>{supplier.name}</option>
                {/each}
            </FormInput>
            <Button>{$_('app.action.create')}</Button>
        </form>
    </MenuSide>
{/if}

<h1>{$_('app.generic.orders')}</h1>
<p>{$_('scm.orders.description')}</p>

<PillMenu>
    <PillMenuButton icon={PlusCircle} click={() => createOrder = !createOrder }>{$_('scm.orders.actions.create.title')}</PillMenuButton>
    <PillMenuButton icon={DocumentMinus} click={() => { showCancelledOrders = !showCancelledOrders; return true; }}>{`scm.orders.${showCancelledOrders ? "hide" : "show"}_cancelled_orders`}</PillMenuButton>
    <PillMenuButton icon={DocumentCheck} click={() => { showCompletedOrders = !showCompletedOrders; return true; }}>{`scm.orders.${showCompletedOrders ? "hide" : "show"}_completed_orders`}</PillMenuButton>
</PillMenu>

{#if data.orders.length > 0}
    <Table headers={[{ label: $_('app.generic.order_number') }, {label: $_('app.generic.supplier') }, {label: $_('scm.orders.amount_gross')}, {label: $_('scm.orders.amount_net')}, {label: $_('app.generic.state')}, { label: $_('app.generic.user_requesting') }]} class="mt-6">
            
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