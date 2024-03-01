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
    import { PlusCircle } from "@steeze-ui/heroicons";
    import type { ActionData, PageData } from "./$types";
    import { _ } from "svelte-i18n";

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
    <title>mink — {$_('app.generic.stores')}</title>
</svelte:head>

<h1>{$_('app.scm.stores.title')}</h1>
<p>{$_('app.scm.stores.desc')}</p>

<PillMenu>
    <PillMenuButton click={() => createStore = !createStore} icon={PlusCircle}>{$_('app.scm.stores.actions.create')}</PillMenuButton>
</PillMenu>

{#if form?.deleteStore?.error !== undefined}
    <Modal title={$_('app.generic.error')} on:close={() => { deleteStoreConfirm = undefined; form = null; }}>
        
        <p>{$_(form.deleteStore.error)}</p>

        {#if form.deleteStore.error === "errors.scm.store.delete.relations-exist"}
            <ul>
                {#if form.deleteStore.storeRelations > 0}<li>{$_('errors.scm.store.delete.store-relations-over-0', { values: { n: form.deleteStore.storeRelations }})}</li>{/if}
                {#if form.deleteStore.articleMovements > 0}<li>{$_('errors.scm.store.delete.article-movement-over-0', { values: { n: form.deleteStore.articleMovements }})}</li>{/if}
            </ul>
        {/if}

        <form slot="form" action="?/deleteStore" method="post" class="flex gap-2" use:enhance>
            <Button role="danger" size="small">{$_('app.action.delete-force')}</Button>
            <input type="hidden" name="id" value={deleteStoreConfirm?.id} />
            <input type="hidden" name="force" value="true" />
            <Button role="tertiary" size="small" on:click={() => { deleteStoreConfirm = undefined; form = null; }} preventSend>{$_('app.action.cancel')}</Button>
        </form>
    </Modal>
{/if}

{#if createStore || editStore}
    <MenuSide on:close={() => { createStore = false; editStore = undefined }} title="{createStore ? "Créer" : "Modifier"} un emplacement de stock">

        {#if form?.upsertStore !== undefined && "error" in form.upsertStore}<p class="text-red-500 font-semibold">{form.upsertStore.error}</p>{/if}

        <form action="?/upsertStore" method="post" use:enhance class="flex flex-col gap-4">
            {#if !createStore}<input type="hidden" name="id" value={editStore?.id} />{/if}

            <FormInput name="name" label="Nom" required value={editStore?.name} />
            <FormInput name="location" label="Emplacement" value={editStore?.location} />

            <FormInput type="checkbox" name="temporary" label="Stock temporaire" checked={editStore?.temporary} />

            <Button role={createStore ? "success" : "warning"}>{$_(`app.action.${createStore ? "create" : "update"}`)}</Button>
        </form>
    </MenuSide>
{/if}

{#if data.stores.length > 0}
    <Table headers={[{ label: $_('app.generic.store_name') }, { label: $_('app.generic.store_location') }, { label: $_('app.generic.actions') }]} class="mt-6">
        {#each data.stores as store}
            <TableCell><a href="/app/scm/stores/{store.id}">{store.name}</a></TableCell>
            <TableCell>{store.location}</TableCell>
            <TableCell>
                <div class="flex flex-row gap-4 items-center">
                    <Button role="warning" size="small" on:click={() => editStore = store}>
                        {$_('app.action.update')}
                    </Button>
                    <form action="?/deleteStore" method="post" use:enhance>
                        <input type="hidden" name="id" value={store.id} />
                        {#if deleteStoreConfirm?.id === store.id}
                            <Button role="danger" size="small" confirm>{$_('app.action.confirm')}</Button>
                        {:else}
                            <Button role="danger" size="small" preventSend on:click={() => deleteStoreConfirm = store}>{$_('app.action.delete')}</Button>
                        {/if}
                    </form>
                </div>
            </TableCell>
        {/each}
    </Table>
{:else}
    <EmptyData on:click={() => createStore = true} />
{/if}