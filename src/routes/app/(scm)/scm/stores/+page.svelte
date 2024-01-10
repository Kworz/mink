<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import EmptyData from "$lib/components/EmptyData.svelte";
    import Button from "$lib/components/generics/Button.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import MenuSide from "$lib/components/generics/menu/MenuSide.svelte";
    import Modal from "$lib/components/generics/modal/Modal.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import type { scm_store } from "@prisma/client";
    import { ExclamationTriangle, PlusCircle } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import type { ActionData, PageData } from "./$types";

    export let data: PageData;
    export let form: ActionData;

    let createStore = false;
    let editStore: scm_store | undefined = undefined;
    let deleteStoreConfirm: scm_store | undefined = undefined;

    $: if(form?.upsertStore !== undefined && "error" in form.upsertStore) { setTimeout(() => form = null, 3000); }
    $: if(form?.upsertStore !== undefined && "success" in form.upsertStore) { createStore = false; editStore = undefined; invalidateAll();}
    $: if(form?.deleteStore !== undefined && "success" in form.deleteStore) { deleteStoreConfirm = undefined; invalidateAll(); }

</script>

<svelte:head>
    <title>mink — Stocks</title>
</svelte:head>

<h1>Emplacements de stock</h1>
<p>Liste des emplacements de stocks</p>

<PillMenu>
    <PillMenuButton click={() => createStore = !createStore} icon={PlusCircle}>Créer une liste</PillMenuButton>
</PillMenu>

{#if deleteStoreConfirm}
    <Modal title="Supprimer {deleteStoreConfirm.name} ?" on:close={() => deleteStoreConfirm = undefined}>
        
        <p class="text-orange-500 font-semibold">
            <Icon src={ExclamationTriangle} class="w-6 inline"/>
            La supression d'un Stock entraine la disparition des éléments associés à ce stock.
        </p>

        <p class="mt-2">Confirmez la suppréssion de {deleteStoreConfirm.name} ?</p>

        <form slot="form" action="?/deleteStore" method="post" use:enhance>
            <Button role="danger" size="small">Supprimer</Button>
            <Button role="tertiary" size="small" on:click={() => deleteStoreConfirm = undefined} preventSend>Annuler</Button>
        </form>
    </Modal>
{/if}

{#if createStore || editStore}
    <MenuSide on:close={() => { createStore = false; editStore = undefined }} title="{createStore ? "Créer" : "Modifier"} un emplacement de stock">

        {#if form?.upsertStore !== undefined && "error" in form.upsertStore}<p class="text-red-500 font-semibold">{form.upsertStore.error}</p>{/if}

        <form action="?/upsertStore" method="post" use:enhance class="flex flex-col gap-4">
            {#if !createStore}<input type="hidden" name="id" value={editStore?.id} />{/if}

            <FormInput name="name" label="Nom" labelMandatory value={editStore?.name} />
            <FormInput name="location" label="Emplacement" value={editStore?.location} />

            <FormInput type="checkbox" name="temporary" label="Stock temporaire" checked={editStore?.temporary} />

            <Button role={createStore ? "success" : "warning"}>{createStore ? "Créer" : "Modifier"}</Button>
        </form>
    </MenuSide>
{/if}

{#if data.stores.length > 0}
    <Table headers={[{ label: "Nom de l'emplacement" }, { label: "Localisation" }, { label: "Actions" }]} class="mt-6">
        {#each data.stores as store}
            <TableCell><a href="/app/scm/stores/{store.id}">{store.name}</a></TableCell>
            <TableCell>{store.location}</TableCell>
            <TableCell>
                <div class="flex flex-row gap-4 items-center">
                    <Button role="warning" size="small" on:click={() => editStore = store}>
                        Modifier
                    </Button>
                    <form action="?/deleteStore" method="post" use:enhance>
                        <input type="hidden" name="id" value={store.id} />
                        {#if deleteStoreConfirm?.id === store.id}
                            <Button role="danger" size="small">Confirmer</Button>
                        {:else}
                            <Button role="danger" size="small" preventSend on:click={() => deleteStoreConfirm = store}>Supprimer</Button>
                        {/if}
                    </form>
                </div>
            </TableCell>
        {/each}
    </Table>
{:else}
    <EmptyData on:click={() => createStore = true} />
{/if}


