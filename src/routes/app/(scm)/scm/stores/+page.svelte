<script lang="ts">
    import { ExclamationTriangle, PlusCircle } from "@steeze-ui/heroicons";

    import type { ActionData, PageData } from "./$types";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import MenuSide from "$lib/components/appLayout/MenuSide.svelte";
    import { enhance } from "$app/forms";
    import FormInput from "$lib/components/FormInput.svelte";
    import Button from "$lib/components/Button.svelte";
    import { invalidateAll } from "$app/navigation";
    
    import Modal from "$lib/components/modal/Modal.svelte";
    import type { SCMStore } from "@prisma/client";
    import Table from "$lib/components/table2/Table.svelte";
    import TableCell from "$lib/components/table2/TableCell.svelte";
    import { Icon } from "@steeze-ui/svelte-icon";

    export let data: PageData;
    export let form: ActionData;

    let createStore = false;
    let editStore: SCMStore | undefined = undefined;
    let deleteStoreConfirm: SCMStore | undefined = undefined;

    $: if(form !== null) { invalidateAll(); createStore = false; editStore = undefined; }

</script>

<svelte:head>
    <title>Nomenclaturize — Stocks</title>
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
    <MenuSide closable on:close={() => { createStore = false; editStore = undefined }}>
        <form action={createStore ? "?/createStore" : "?/editStore"} method="post" use:enhance class="flex flex-col gap-4">
        
            {#if !createStore}<input type="hidden" name="id" value={editStore?.id} />{/if}

            <FormInput name="name" label="Nom" labelMandatory value={editStore?.name} />
            <FormInput name="location" label="Emplacement" value={editStore?.location} />

            <FormInput type="checkbox" name="temporary" label="Stock temporaire" checked={editStore?.temporary} />

            <Button role={createStore ? "success" : "warning"}>{createStore ? "Créer" : "Modifier"}</Button>
        
        </form>
    </MenuSide>
{/if}

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
