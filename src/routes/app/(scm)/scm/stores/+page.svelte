<script lang="ts">

    // TODO: find out why selected has reactivity issues
    
    import { enhance } from "$app/forms";
    import { goto, invalidateAll } from "$app/navigation";
    import EmptyData from "$lib/components/EmptyData.svelte";
    import Store from "$lib/components/derived/store/Store.svelte";
    import Button from "$lib/components/generics/Button.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import MenuSide from "$lib/components/generics/menu/MenuSide.svelte";
    import Modal from "$lib/components/generics/modal/Modal.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import type { scm_store } from "@prisma/client";
    import { PlusCircle, Trash } from "@steeze-ui/heroicons";
    import type { ActionData, PageData } from "./$types";
    import { _ } from "svelte-i18n";
    import { page } from "$app/stores";
    import { browser } from "$app/environment";
    import TableCellCheckbox from "$lib/components/generics/table/TableCellCheckbox.svelte";

    export let data: PageData;
    export let form: ActionData;

    let showListLinkedStores = $page.url.searchParams.has("showListLinkedStores") ? $page.url.searchParams.get("showListLinkedStores") === "true" : false;

    let selected: Array<string> = [];

    let createStore = false;
    let editStore: scm_store | undefined = undefined;

    let deleteStores = false;
    let deleteStoreSuspense = false;

    const refresh = () => { if(browser) { goto(`?showListLinkedStores=${showListLinkedStores}`, { noScroll: true }); }}

    $: if(form?.upsertStore !== undefined && "error" in form.upsertStore) { setTimeout(() => form = null, 3000); }
    $: if(form?.upsertStore !== undefined && "success" in form.upsertStore) { createStore = false; editStore = undefined; invalidateAll();}
    $: if(form?.delete !== undefined) { deleteStoreSuspense = false; }
    $: if(form?.delete !== undefined && "success" in form.delete) { deleteStores = false; invalidateAll(); }

    $: showListLinkedStores, refresh();

</script>

<svelte:head>
    <title>mink — {$_('app.generic.stores')}</title>
</svelte:head>

<h1>{$_('app.scm.stores.title')}</h1>
<p>{$_('app.scm.stores.desc')}</p>

<FormInput type="checkbox" name="showLinkedListStores" label="{$_('app.scm.stores.show-linked-list')}" bind:checked={showListLinkedStores} />

<PillMenu message={selected.length > 0 ? $_('scm.stores.selected', { values: { n: selected.length }}) : undefined}>
    <PillMenuButton click={() => createStore = !createStore} icon={PlusCircle}>{$_('app.scm.stores.actions.create')}</PillMenuButton>
    {#if selected.length > 0}
        <PillMenuButton icon={Trash} role="danger" click={() => deleteStores = true}>{$_('scm.stores.action.delete_batch', { values: { n: selected.length }})}</PillMenuButton>
    {/if}
</PillMenu>

{#if deleteStores}
    <Modal title={$_('app.action.delete')} on:close={() => { deleteStores = false; form = null; }}>

        {#if form?.delete !== undefined && "error" in form.delete}
            <p>{$_(form.delete.error)}</p>

            {#if "warnings" in form.delete}
                {#each form.delete.warnings as warning}
                    <details class="mb-2 last-of-type:mb-[1px]">
                        <summary><Store store={warning.store} /></summary>
                        <ul>
                            {#if warning.storeRelations > 0}<li>{$_('errors.scm.store.delete.store-relations-over-0', { values: { n: warning.storeRelations }})}</li>{/if}
                            {#if warning.articleMovements > 0}<li>{$_('errors.scm.store.delete.article-movement-over-0', { values: { n: warning.articleMovements }})}</li>{/if}
                            {#if warning.linkedList !== null}<li>{$_('errors.scm.store.delete.store-relations-has-linked-list')}</li>{/if}
                        </ul>
                    </details>
                {/each}
            {/if}
        {:else}
            <p>{$_('scm.store.action.delete_batch', { values: { n: selected.length }})}</p>
        {/if}

        <form slot="form" action="?/delete" method="post" class="flex gap-2" use:enhance on:submit={() => deleteStoreSuspense = true}>

            <input type="hidden" name="ids" value={selected.join(",")} />

            {#if form?.delete?.error === undefined}
                <Button role="danger" size="small" suspense={deleteStoreSuspense}>{$_('app.action.delete')}</Button>
            {:else}
            <input type="hidden" name="force" value="true" />
                <Button role="danger" size="small" suspense={deleteStoreSuspense}>{$_('app.action.delete-force')}</Button>
            {/if}
            <Button role="tertiary" size="small" on:click={() => { deleteStores = false; form = null; }} preventSend>{$_('app.action.cancel')}</Button>
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

            <Button role={createStore ? "success" : "warning"}>{$_(`app.action.${createStore ? "create" : "update"}`)}</Button>
        </form>
    </MenuSide>
{/if}

{#if data.stores.length > 0}
    <Table bind:selected selectables={data.stores.map(s => s.id)} headers={["selectAll", { label: $_('app.generic.store_name') }, { label: $_('app.generic.store_location') }, {label: $_('app.generic.store_list_linked')}, { label: $_('app.generic.actions') }]} class="mt-6">
        {#each data.stores as store (store.id)}
            <TableCellCheckbox bind:group={selected} value={store.id} />
            <TableCell><a href="/app/scm/stores/{store.id}">{store.name}</a></TableCell>
            <TableCell>{store.location}</TableCell>
            <TableCell>{$_(`app.generic.boolean-other.${store.assemblies_buylist !== null}`)}</TableCell>
            <TableCell>
                <div class="flex flex-row gap-4 items-center">
                    <Button role="warning" size="small" on:click={() => editStore = store}>
                        {$_('app.action.update')}
                    </Button>
                </div>
            </TableCell>
        {/each}
    </Table>
{:else}
    <EmptyData on:click={() => createStore = true} />
{/if}