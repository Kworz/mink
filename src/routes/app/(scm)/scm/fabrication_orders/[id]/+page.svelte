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
    import { scm_fabrication_order_state } from "@prisma/client";
    import { Trash, Wrench } from "@steeze-ui/heroicons";
    import type { ActionData, PageData } from "./$types";

    export let data: PageData;
    export let form: ActionData;

    let editFabricationOrder = false;
    let deleteConfirm = false;

    $: if(deleteConfirm) { setTimeout(() => deleteConfirm = false, 5000) };
    $: if(form?.edit !== null) { editFabricationOrder = false };
</script>

{#if editFabricationOrder}
    <MenuSide on:close={() => editFabricationOrder = false} title="Modifier l'ordre de fabrication">
        <form action="?/editFabOrder" method="post" use:enhance class="flex flex-col gap-4">
            <FormInput label="Date butoir" name="end_date" labelMandatory type="date" value={data.fabricationOrder.end_date?.toISOString()} />
            <FormInput label="Quantité" name="quantity" labelMandatory type="number" value={data.fabricationOrder.quantity} />
            <FormInput label="Receveur" name="receiver" type="select" value={data.fabricationOrder.receiver?.id}>
                <option value={undefined}>Aucun</option>
                {#each data.users as user}
                    <option value={user.id}>{user.username}</option>
                {/each}
            </FormInput>
            <FormInput label="Etat" name="state" type="select" value={data.fabricationOrder.state}>
                {#each Object.keys(scm_fabrication_order_state) as state}
                    <option value={state}>{state}</option>
                {/each}
            </FormInput>
            <Button role="success">Modifier l'ordre de fabrication</Button>
        </form>
    </MenuSide>
{/if}

{#if deleteConfirm}
    <Modal on:close={() => deleteConfirm = false} title="Confirmer la suppression">
        <p>Souhaitez vous réellement supprimer cet ordre de fabrication ?</p>
        <form action="?/deleteFabOrder" method="post" use:enhance slot="form">
            <Button role="danger">Supprimer l'ordre de fabrication</Button>
        </form>
    </Modal>
{/if}

<PillMenu>
    <PillMenuButton icon={Wrench} role="warning" click={() => editFabricationOrder = true}>Modifier l'ordre de fabrication</PillMenuButton>
    <PillMenuButton icon={Trash} role="danger" click={() => deleteConfirm = true}>Supprimer l'ordre de fabrication</PillMenuButton>
</PillMenu>

<h1>Ordre de fabrication <RoundedLabel>#{data.fabricationOrder.id}</RoundedLabel></h1>

<p>État de la demande <DetailLabel>{data.fabricationOrder.state}</DetailLabel>.</p>
<p>Demandeur: <DetailLabel>{data.fabricationOrder.askedBy.username}</DetailLabel>.</p>
<p>Receveur: <DetailLabel>{data.fabricationOrder.receiver?.username}</DetailLabel>.</p>
<p>Date butoir: <DetailLabel>{data.fabricationOrder.end_date}</DetailLabel>.</p>
<p>Statut: <DetailLabel>{data.fabricationOrder.state}</DetailLabel>.</p>

<Wrapper class="mt-6">
    <h3 class="mb-4">Article à fabriquer</h3>
    
    <Flex items="center" justify="between">
        {#if data.fabricationOrder.article !== undefined}
            <ArticleRow article={data.fabricationOrder.article} />
        {/if}
        <h1 class="mr-12 text-zinc-500/50 dark:text-white/50">x {data.fabricationOrder.quantity}</h1>
    </Flex>

    {#if !(data.fabricationOrder.state === "draft" || data.fabricationOrder.state === "cancelled")}
        <form action="?/completeFabOrder" method="post" use:enhance class="mt-6 flex flex-row gap-4 items-end">
            {#if form?.completeFabOrder?.error === "scm.fabricration_order.complete.error.missing_store_in"}
                <FormInput label="Stock de destination" name="store_in" labelMandatory type="select">
                    {#each form.completeFabOrder.stores as store}
                        <option value={store.id}>{store.name} / {store.location}</option>
                    {/each}
                </FormInput>

                <Button role="success">Ordre de fabrication terminé</Button>
            {:else}
                <Button>Valider l'odre de fabrication</Button>
            {/if}
        </form>
    {/if}
</Wrapper>

