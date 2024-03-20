<script lang="ts">
    import { browser } from "$app/environment";
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import AssemblyPreview from "$lib/components/derived/assemblies/AssemblyPreview.svelte";
    import Filter from "$lib/components/derived/filter/Filter.svelte";
    import Button from "$lib/components/generics/Button.svelte";
    import RoundedLabel from "$lib/components/generics/RoundedLabel.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import { PlusCircle, Printer, Squares2x2, Trash } from "@steeze-ui/heroicons";
    import type { ActionData, PageData } from "./$types";
    import MenuSide from "$lib/components/generics/menu/MenuSide.svelte";
    import EmptyData from "$lib/components/EmptyData.svelte";
    import { _ } from "svelte-i18n";
    import Modal from "$lib/components/generics/modal/Modal.svelte";

    export let data: PageData;
    export let form: ActionData;

    let filter = $page.url.searchParams.has("filter") ? JSON.parse(decodeURIComponent($page.url.searchParams.get("filter")!)) : {};
    let sort = $page.url.searchParams.has("sort") ? JSON.parse(decodeURIComponent($page.url.searchParams.get("sort")!)) : {};

    let createList = false;
    let showClosedLists = false;
    let createMultipleLists = false;

    let confirmDelete = false;

    let selected: string[] = [];

    const refresh = () => { if(browser) goto(`?sort=${encodeURIComponent(JSON.stringify(sort))}&filter=${encodeURIComponent(JSON.stringify(filter))}`, { noScroll: true }); }

    $: filter, sort, refresh();
    $: lists = data.lists.filter(list => !showClosedLists ? (list.closed === false) : true);

    $: if(form?.deleteList?.success === true) { selected = []; confirmDelete = false; form = null; }

</script>

{#if form?.createList?.error !== undefined}
    <Modal title={$_('app.generic.error')} on:close={() => form = null}>
        <p>{$_(form.createList.error)}</p>

        <div slot="form">
            <Button role="primary" size="small">{$_('app.generic.ok')}</Button>
        </div>
    </Modal>
{/if}

{#if confirmDelete}
    <Modal title={$_('app.scm.lists.action.delete', { values: { n: selected.length }})} on:close={() => confirmDelete = false}>
        <p>{$_('app.scm.lists.action.delete-confirm', { values: { n: selected.length }})}</p>

        <form slot="form" method="post" action="?/deleteList" use:enhance class="flex gap-2">
            <input type="hidden" name="ids" value={selected.join(",")} />
            <Button role="danger" size="small">{$_('app.action.delete')}</Button>
            <Button role="tertiary" size="small" preventSend on:click={() => confirmDelete = false}>{$_('app.generic.cancel')}</Button>
        </form>
    </Modal>
{/if}

{#if createList}
    <MenuSide on:close={() => createList = false} title="Créer une liste">
        <form action="?/createList" method="post" use:enhance class="flex flex-col gap-4">
            <FormInput name="name" label="Nom de la liste" required min={3} />

            <FormInput name="store_location" label="Emplacement de stockage" />

            <FormInput name="assembly_id" type="select" label="Assemblage" required value="">
                <option value="">—</option>
                    {#each data.assemblies as assembly}
                        <option value={assembly.id}>{assembly.name}</option>
                    {/each}
            </FormInput>
            <FormInput name="project_id" type="select" label="Affaire" value="">
                <option value="">—</option>
                {#each data.projects as project}
                    <option value={project.id}>{project.name}</option>
                {/each}
            </FormInput>

            <FormInput name="multipleCreate" label="Créer plusieurs listes" type="checkbox" bind:checked={createMultipleLists} />

            {#if createMultipleLists}<FormInput name="list_amount" type="number" label="Nombre de listes" min={2} step={1} value={2} />{/if}

            <Button>Créer</Button>
        </form>
    </MenuSide>
{/if}

<h1>Listes d'achat d'assemblages</h1>
<p>Suivez précisément les achats pour votre nomenclature.</p>

<PillMenu message={(selected.length > 0 ? `${selected.length} éléments sélectionnés` : undefined)}>
    <PillMenuButton icon={PlusCircle} click={() => createList = !createList}>Créer une liste</PillMenuButton>
    {#if selected.length > 0}
        {@const firstList = data.lists.find(list => list.id === selected[0])}
        {#if !selected.some(s => data.lists.find(l => l.id === s)?.assembly_id !== firstList?.assembly_id)}
            <PillMenuButton role="primary" icon={Squares2x2} click={() => goto(`/app/scm/lists/grid?ids=${selected.join(",")}`)}>Ouvrir la grille</PillMenuButton>
        {/if}

        <PillMenuButton role="secondary" icon={Printer} click={() => window.open(`/app/scm/lists/print?lists=${selected.join(",")}`, '_blank')}>Imprimer</PillMenuButton>

        <PillMenuButton role="danger" icon={Trash} click={() => confirmDelete = true}>{$_('app.scm.lists.action.delete', { values: { n: selected.length }})}</PillMenuButton>
    {/if}
</PillMenu>

{#if data.lists.length > 0}
    <FormInput type="checkbox" name="" label="Afficher les listes terminées" bind:checked={showClosedLists} />

    <Filter bind:filter availableFilters={[
        { name: "name", default: true, type: "string" },
        { name: "assembly.name", type: "string" },
        { name: "project.name", type: "string" },
        { name: "closed", type: "boolean" }
    ]} class="mt-6" />

    <Table 
        headers={[
            "selectAll",
            { label: "Liste", colname: "name" },
            { label: "Terminée", colname: "closed" },
            { label: "Assemblage de base", colname: "assembly.name" },
            { label: "Affaire", colname: "project.name" }
        ]}
        selectables={lists.map(l => l.id)}
        bind:selected={selected}
        bind:sort
        class="mt-6"
    >

        {#each lists as list}
            <TableCell position="center"><input type="checkbox" bind:group={selected} value={list.id} /></TableCell>
            <TableCell><a href="/app/scm/lists/{list.id}">{list.name}</a></TableCell>
            <TableCell><RoundedLabel role={list.closed ? "success" : "warning"}>{list.closed ? "Terminée" : "En cours"}</RoundedLabel></TableCell>
            <TableCell><AssemblyPreview assembly={list.assembly} /></TableCell>
            <TableCell>{list.project?.name}</TableCell>
        {/each}

    </Table>
{:else}
    <EmptyData on:click={() => createList = true} />
{/if}