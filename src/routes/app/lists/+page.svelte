<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import AssemblyPreview from "$lib/components/assemblies/AssemblyPreview.svelte";
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { Collections, type AssembliesBuylistsRecord } from "$lib/DBTypes";
    import { PlusCircle } from "@steeze-ui/heroicons";
    import type { PageData } from "./$types";
    import Filter2 from "$lib/components/filter/Filter2.svelte";
    import RoundedLabel from "$lib/components/RoundedLabel.svelte";

    export let data: PageData;

    let createList = false;

    let showClosedLists = false;

    let createListName = "";
    let createListBaseAssembly: string | undefined = undefined;
    let createListProject: string | undefined = undefined;

    const createListFn = async () => {

        if(createListName === "" || createListBaseAssembly === undefined || createListProject === undefined)
        { return }

        const list = {
            name: createListName,
            assembly: createListBaseAssembly,
            project: createListProject,
        } satisfies AssembliesBuylistsRecord;

        try
        {
            const listCreated = await $page.data.pb.collection(Collections.AssembliesBuylists).create(list);
            goto("/app/lists/" + listCreated.id);
        }
        catch(ex)
        {
            console.log(ex);
        }
    }

    $: lists = data.lists.filter(list => !showClosedLists ? (list.closed === false) : true);

</script>

<Wrapper>
    <h3>Listes d'achat d'assemblages</h3>

    <FormInput type="checkbox" name="" label="Afficher les listes terminées" bind:checked={showClosedLists} />

    <PillMenu>
        <PillMenuButton icon={PlusCircle} click={() => createList = !createList}>Créer une liste</PillMenuButton>
    </PillMenu>

    <Filter2 class="mt-6 mb-2" />

    {#if createList}
        <h4>Créer une liste</h4>
        <div class="flex flex-col md:flex-row gap-4 items-start md:items-end mt-6">
            <FormInput name="name" label="Nom de la liste" labelMandatory bind:value={createListName} />
            <FormInput name="assembly" type="select" label="Assemblage" labelMandatory bind:value={createListBaseAssembly}>
                {#await $page.data.pb.collection(Collections.Assemblies).getFullList({sort: "-favorite,name"}) then assemblies}
                    <option value={undefined}>—</option>
                    {#each assemblies as assembly}
                        <option value={assembly.id}>{assembly.name}</option>
                    {/each}
                {/await}
            </FormInput>
            <FormInput name="project" type="select" label="" labelMandatory bind:value={createListProject} >
                {#await $page.data.pb.collection(Collections.Projects).getFullList({sort: "-updated,name"}) then projects}
                    <option value={undefined}>—</option>
                    {#each projects as project}
                        <option value={project.id}>{project.name}</option>
                    {/each}
                {/await}
            </FormInput>
            <Button on:click={createListFn}>Créer</Button>
        </div>
    {/if}

    <Table embeded marginTop="">
        <svelte:fragment slot="head">
            <TableHead>Liste</TableHead>
            {#if showClosedLists}<TableHead>Terminée</TableHead>{/if}
            <TableHead>Assemblage de base</TableHead>
            <TableHead>Affaire</TableHead>
            
        </svelte:fragment>
    
        <svelte:fragment slot="body">
            {#each lists as list}
                <TableRow>
                    <TableCell><a href="/app/lists/{list.id}">{list.name}</a></TableCell>
                    {#if showClosedLists}<TableCell><RoundedLabel role={list.closed ? "success" : "warning"}>{list.closed ? "Terminée" : "En cours"}</RoundedLabel></TableCell>{/if}
                    <TableCell><AssemblyPreview assembly={list.expand?.assembly} /></TableCell>
                    <TableCell>{list.expand?.project?.name}</TableCell>
                </TableRow>
            {/each}
        </svelte:fragment>
    </Table>
</Wrapper>