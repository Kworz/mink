<script lang="ts">
    import { enhance } from "$app/forms";
    import ArticleRow from "$lib/components/derived/article/ArticleRow.svelte";
    import Button from "$lib/components/generics/Button.svelte";
    import DetailLabel from "$lib/components/generics/DetailLabel.svelte";
    import RoundedLabel from "$lib/components/generics/RoundedLabel.svelte";
    import Wrapper from "$lib/components/generics/containers/Wrapper.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import MenuSide from "$lib/components/generics/menu/MenuSide.svelte";
    import Modal from "$lib/components/generics/modal/Modal.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import type { scm_store } from "@prisma/client";
    import { scm_manufacturing_order_state } from "$lib/prisma-enums";
    import { Trash, Wrench } from "@steeze-ui/heroicons";
    import type { ActionData, PageData } from "./$types";
    import { _ } from "svelte-i18n";
    import Date from "$lib/components/generics/formatters/Date.svelte";
    import User from "$lib/components/derived/user/User.svelte";

    export let data: PageData;
    export let form: ActionData & { completeManufacturingOrder: { error: string, stores: scm_store[] }};

    let editManufacturingOrder = false;
    let deleteConfirm = false;

    $: if(deleteConfirm) { setTimeout(() => deleteConfirm = false, 5000) };
    $: if(form?.edit !== null) { editManufacturingOrder = false };
</script>

<svelte:head>
    <title>{$_('app.generic.manufacturing_order')} #{data.manufacturingOrder.id} — mink</title>
</svelte:head>

{#if editManufacturingOrder}
    <MenuSide on:close={() => editManufacturingOrder = false} title={$_('scm.manufacturing_orders.actions.edit.title')}>
        <form action="?/editManufacturingOrder" method="post" use:enhance class="flex flex-col gap-4">
            <FormInput label={$_('app.generic.limit_date')} name="end_date" required type="date" value={data.manufacturingOrder.end_date?.toISOString()} />
            <FormInput label={$_('app.generic.quantity')} name="quantity" required type="number" value={data.manufacturingOrder.quantity} />
            <FormInput label={$_('app.generic.user_receiving')} name="receiver" type="select" value={data.manufacturingOrder.receiver?.id}>
                <option value={undefined}>Aucun</option>
                {#each data.users as user}
                    <option value={user.id}>{user.username}</option>
                {/each}
            </FormInput>
            <FormInput label="Etat" name="state" type="select" value={data.manufacturingOrder.state}>
                {#each Object.keys(scm_manufacturing_order_state) as state}
                    <option value={state}>{state}</option>
                {/each}
            </FormInput>
            <Button role="success">{$_('app.action.validate')}</Button>
        </form>
    </MenuSide>
{/if}

{#if deleteConfirm}
    <Modal on:close={() => deleteConfirm = false} title={$_('scm.manufacturing_orders.actions.delete.title')}>
        <p>{$_('scm.manufacturing_orders.actions.delete.body')}</p>
        <form action="?/deleteManufacturingOrder" method="post" use:enhance slot="form">
            <Button role="danger">{$_('app.action.delete')}</Button>
        </form>
    </Modal>
{/if}

<PillMenu>
    <PillMenuButton icon={Wrench} role="warning" click={() => editManufacturingOrder = true}>{$_('scm.manufacturing_orders.actions.edit.title')}</PillMenuButton>
    <PillMenuButton icon={Trash} role="danger" click={() => deleteConfirm = true}>{$_('scm.manufacturing_orders.actions.delete.title')}</PillMenuButton>
</PillMenu>

<h1>{$_('app.generic.manufacturing_order')} <RoundedLabel>#{data.manufacturingOrder.id}</RoundedLabel></h1>

<p>{$_('app.generic.state')}: <DetailLabel>{data.manufacturingOrder.state}</DetailLabel>.</p>
<p>{$_('app.generic.limit_date')}: <Date date={data.manufacturingOrder.end_date} />.</p>
<p class="flex flex-row gap-2 items-center mb-2">{$_('app.generic.user_requesting')}: <User user={data.manufacturingOrder.askedBy}/></p>
<p class="flex flex-row gap-2 items-center">{$_('app.generic.user_receiving')}: <User user={data.manufacturingOrder.receiver} /></p>

<Wrapper class="mt-6">
    <h3 class="mb-4">{$_('app.generic.article_to_manufacture')}</h3>
    
    <Flex items="center" justify="between">
        {#if data.manufacturingOrder.article !== undefined}
            <ArticleRow article={data.manufacturingOrder.article} />
        {/if}
        <h1 class="mr-12 text-zinc-500/50 dark:text-white/50">x {data.manufacturingOrder.quantity}</h1>
    </Flex>

    {#if !(data.manufacturingOrder.state === "draft" || data.manufacturingOrder.state === "cancelled")}
        <form action="?/completeManufacturingOrder" method="post" use:enhance class="mt-6 flex flex-row gap-4 items-end">
            {#if form?.completeManufacturingOrder !== undefined && "error" in form.completeManufacturingOrder && "stores" in form.completeManufacturingOrder}
                <FormInput label={$_('app.generic.destination_store')} name="store_in" required type="select">
                    {#each form.completeManufacturingOrder.stores as store}
                        <option value={store.id}>{store.name} / {store.location}</option>
                    {/each}
                </FormInput>

                <Button role="success">{$_('app.action.complete')}</Button>
            {:else}
                <Button>{$_('app.action.validate')}</Button>
            {/if}
        </form>
    {/if}
</Wrapper>

