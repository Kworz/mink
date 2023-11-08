<script lang="ts">
    import HomeMenuGrid from "$lib/components/HomeMenuGrid.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { PlusCircle, Trash, Wrench } from "@steeze-ui/heroicons";

    import type { ActionData, PageData } from "./$types";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { Collections, type StoresResponse } from "$lib/DBTypes";
    import MenuSide from "$lib/components/appLayout/MenuSide.svelte";
    import { enhance } from "$app/forms";
    import FormInput from "$lib/components/FormInput.svelte";
    import Button from "$lib/components/Button.svelte";
    import { invalidateAll } from "$app/navigation";
    import { page } from "$app/stores";
    
    import Modal from "$lib/components/modal/Modal.svelte";
    import Flex from "$lib/components/layout/flex.svelte";

    export let data: PageData;
    export let form: ActionData;

    let createStore = false;
    let editStore: StoresResponse | undefined = undefined;
    let deleteStoreConfirm: StoresResponse | undefined = undefined;

    $: if(form !== null) { invalidateAll(); createStore = false; editStore = undefined; }

    const deleteStore = async (store: StoresResponse) => {

        if(deleteStoreConfirm?.id === store.id)
        {
            await $page.data.pb.collection(Collections.Stores).delete(store.id);
            deleteStoreConfirm = undefined;
            invalidateAll();
        }
        else
            deleteStoreConfirm = store;
    }

</script>

<svelte:head>
    <title>Nomenclaturize — Stocks</title>
</svelte:head>

<Wrapper>
    <h3>Emplacements de stock</h3>
    <p>Liste des emplacements de stocks</p>

    <PillMenu>
        <PillMenuButton click={() => createStore = !createStore} icon={PlusCircle}>Créer une liste</PillMenuButton>
    </PillMenu>
</Wrapper>

{#if deleteStoreConfirm}
    <Modal title="Supprimer {deleteStoreConfirm.name} ?" on:close={() => deleteStoreConfirm = undefined}>
        <p>Confirmez la suppréssion de {deleteStoreConfirm.name}</p>
        
        <Flex class="mt-4">
            <Button role="danger" size="small" on:click={() => deleteStore(deleteStoreConfirm)}>Supprimer</Button>
            <Button role="tertiary" size="small" on:click={() => deleteStoreConfirm = undefined}>Annuler</Button>
        </Flex>
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

<HomeMenuGrid>
    {#each data.stores as store}
        <a href="/app/scm/stores/{store.id}" class="relative">
            <Wrapper>
                <div class="absolute top-4 right-4 flex flex-row gap-2">
                    <button class="h-5 w-5 text-orange-500" on:click|preventDefault={() => editStore = store}>
                        <Icon src={Wrench} />
                    </button>

                    <button class="h-5 w-5 text-red-500" on:click|preventDefault={() => deleteStore(store)}>
                        <Icon src={Trash} />
                    </button>

                </div>
                <h3>{store.name}</h3>
                <p class="text-sm text-zinc-500">{store.location}</p>
            </Wrapper>
        </a>
    {/each}
</HomeMenuGrid>