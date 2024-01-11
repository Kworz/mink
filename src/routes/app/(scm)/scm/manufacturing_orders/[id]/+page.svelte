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
    import { scm_manufacturing_order_state } from "@prisma/client";
    import { Trash, Wrench } from "@steeze-ui/heroicons";
    import type { ActionData, PageData } from "./$types";
    import { _ } from "svelte-i18n";

    export let data: PageData;
    export let form: ActionData;

    let editManufacturingOrder = false;
    let deleteConfirm = false;

    $: if(deleteConfirm) { setTimeout(() => deleteConfirm = false, 5000) };
    $: if(form?.edit !== null) { editManufacturingOrder = false };
</script>

<svelte:head>
    <title>{$_('app.generic.manufacturing_order')} #{data.manufacturingOrder.id} — mink</title>
</svelte:head>

{#if editManufacturingOrder}
    <MenuSide on:close={() => editManufacturingOrder = false} title="Modifier l'ordre de manufacturing">
        <form action="?/editManufacturingOrder" method="post" use:enhance class="flex flex-col gap-4">
            <FormInput label="Date butoir" name="end_date" labelMandatory type="date" value={data.manufacturingOrder.end_date?.toISOString()} />
            <FormInput label="Quantité" name="quantity" labelMandatory type="number" value={data.manufacturingOrder.quantity} />
            <FormInput label="Receveur" name="receiver" type="select" value={data.manufacturingOrder.receiver?.id}>
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
            <Button role="success">Modifier l'ordre de manufacturing</Button>
        </form>
    </MenuSide>
{/if}

{#if deleteConfirm}
    <Modal on:close={() => deleteConfirm = false} title="Confirmer la suppression">
        <p>Souhaitez vous réellement supprimer cet ordre de manufacturing ?</p>
        <form action="?/deleteManufacturingOrder" method="post" use:enhance slot="form">
            <Button role="danger">Supprimer l'ordre de manufacturing</Button>
        </form>
    </Modal>
{/if}

<PillMenu>
    <PillMenuButton icon={Wrench} role="warning" click={() => editManufacturingOrder = true}>Modifier l'ordre de manufacturing</PillMenuButton>
    <PillMenuButton icon={Trash} role="danger" click={() => deleteConfirm = true}>Supprimer l'ordre de manufacturing</PillMenuButton>
</PillMenu>

<h1>{$_('app.generic.manufacturing_order')} <RoundedLabel>#{data.manufacturingOrder.id}</RoundedLabel></h1>

<p>État de la demande <DetailLabel>{data.manufacturingOrder.state}</DetailLabel>.</p>
<p>Demandeur: <DetailLabel>{data.manufacturingOrder.askedBy.username}</DetailLabel>.</p>
<p>Receveur: <DetailLabel>{data.manufacturingOrder.receiver?.username}</DetailLabel>.</p>
<p>Date butoir: <DetailLabel>{data.manufacturingOrder.end_date}</DetailLabel>.</p>
<p>Statut: <DetailLabel>{data.manufacturingOrder.state}</DetailLabel>.</p>

<Wrapper class="mt-6">
    <h3 class="mb-4">Article à fabriquer</h3>
    
    <Flex items="center" justify="between">
        {#if data.manufacturingOrder.article !== undefined}
            <ArticleRow article={data.manufacturingOrder.article} />
        {/if}
        <h1 class="mr-12 text-zinc-500/50 dark:text-white/50">x {data.manufacturingOrder.quantity}</h1>
    </Flex>

    {#if !(data.manufacturingOrder.state === "draft" || data.manufacturingOrder.state === "cancelled")}
        <form action="?/completeManufacturingOrder" method="post" use:enhance class="mt-6 flex flex-row gap-4 items-end">
            {#if form?.completeFabOrder?.error === "scm.fabricration_order.complete.error.missing_store_in"}
                <FormInput label="Stock de destination" name="store_in" labelMandatory type="select">
                    {#each form.completeFabOrder.stores as store}
                        <option value={store.id}>{store.name} / {store.location}</option>
                    {/each}
                </FormInput>

                <Button role="success">Ordre de manufacturing terminé</Button>
            {:else}
                <Button>Valider l'odre de manufacturing</Button>
            {/if}
        </form>
    {/if}
</Wrapper>

