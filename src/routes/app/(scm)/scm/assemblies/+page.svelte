<script lang="ts">
    import { browser } from "$app/environment";
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import EmptyData from "$lib/components/EmptyData.svelte";
    import Filter from "$lib/components/derived/filter/Filter.svelte";
    import Button from "$lib/components/generics/Button.svelte";
    import Wrapper from "$lib/components/generics/containers/Wrapper.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import { PlusCircle, VideoCameraSlash } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import type { ActionData, PageData } from "./$types";
    import MenuSide from "$lib/components/generics/menu/MenuSide.svelte";
    import { _ } from "svelte-i18n";
    import { page } from "$app/stores";
    import AssemblyPreview2 from "$lib/components/derived/assemblies/AssemblyPreview2.svelte";

    export let data: PageData;
    export let form: ActionData;

    let filter = $page.url.searchParams.has("filter") ? JSON.parse(decodeURIComponent($page.url.searchParams.get("filter")!)) : {};

    let createAssembly = false;
    let createFormSent = false;

    const refresh = () => { if(browser) goto(`/app/scm/assemblies/?filter=${encodeURIComponent(JSON.stringify(filter))}`); }

    $: filter, refresh();

    $: if(form?.createAssembly.error !== undefined) { createFormSent = false; setTimeout(() => form = null, 3000); }

</script>

<svelte:head>
    <title>{$_('scm.assemblies.list')} — mink</title>
</svelte:head>

{#if createAssembly}
    <MenuSide on:close={() => createAssembly = false} title={$_('scm.assemblies.actions.create')}>
        {#if form?.createAssembly && "error" in form.createAssembly}<p class="text-red-500 mb-2">{$_(form.createAssembly.error)}</p>{/if}

        <form action="?/createAssembly" method="post" use:enhance class="flex flex-col gap-4" on:submit={() => createFormSent = true}>
            <FormInput name="name" label={$_('scm.assembly.name')} required value={form?.createAssembly.name ?? ""} />
            <FormInput name="description" label={$_('app.generic.description')} value={form?.createAssembly.description ?? ""} />
            <Button role="primary" class="self-start" suspense={createFormSent}>{$_('app.action.create')}</Button>
        </form>
    </MenuSide>
{/if}

<h1>{$_('scm.assemblies.list')}</h1>
<p>{$_('scm.assemblies.description')}</p>

<PillMenu>
    <PillMenuButton icon={PlusCircle} click={() => createAssembly = !createAssembly}>{$_('scm.assemblies.actions.create')}</PillMenuButton>
</PillMenu>

{#if data.assemblies.length > 0 || Object.keys(filter).length != 0}
    <Filter bind:filter availableFilters={[{ name: "name", default: true, type: "string" }, { name:"description", type: "string" }]} class="mt-6" />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:cols-4 gap-6 mt-6">
        {#each data.assemblies as assembly}
            <Wrapper><AssemblyPreview2 {assembly} /></Wrapper>
        {:else}
            <Wrapper>
                <!-- TODO: Replace with a component -->
                <h2>Aucun élément trouvé 🥲</h2>
                <p class="mt-2">Les paramètres de filtre n'ont permis de trouver aucun élément.</p>
            </Wrapper>
        {/each}
    </div>
{:else}
    <EmptyData on:click={() => createAssembly = true }/>
{/if}

