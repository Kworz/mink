<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import AssemblyPreview from "$lib/components/assemblies/AssemblyPreview.svelte";
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
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

    export let data: PageData;

    let createList = false;

    let createListName = "";
    let createListBaseAssembly = "";
    let createListProject = "";

    const createListFn = async () => {

        if(createListName === "" || createListBaseAssembly === "" || createListProject === "")
            return;

        const list = {
            name: createListName,
            assembly: createListBaseAssembly,
            project: createListProject,
        } satisfies AssembliesBuylistsRecord;

        try
        {
            const listCreated = await $page.data.pb.collection(Collections.AssembliesBuylists).create(list);
            goto("/app/lists2/" + listCreated.id);
        }
        catch(ex)
        {
            console.log(ex);
        }
    }

</script>

<Wrapper>
    <h3>Listes d'achat d'assemblages (v2)</h3>

    <PillMenu>
        <PillMenuButton icon={PlusCircle} click={() => createList = !createList}>Créer une liste</PillMenuButton>
    </PillMenu>

    {#if createList}
        <div class="flex flex-col md:flex-row gap-4 items-start md:items-end mt-6">
            <h4>Créer une liste</h4>
            <FormInput name="name" label="Nom de la liste" labelMandatory bind:value={createListName} />
            <FormInput name="assembly" type="select" label="Assemblage" labelMandatory bind:value={createListBaseAssembly}>
                {#await $page.data.pb.collection(Collections.Assemblies).getFullList() then assemblies}
                    {#each assemblies as assembly}
                        <option value={assembly.id}>{assembly.name}</option>
                    {/each}
                {/await}
            </FormInput>
            <FormInput name="project" type="select" label="" labelMandatory bind:value={createListProject} >
                {#await $page.data.pb.collection(Collections.Projects).getFullList() then projects}
                    {#each projects as project}
                        <option value={project.id}>{project.name}</option>
                    {/each}
                {/await}
            </FormInput>
            <Button on:click={createListFn}>Créer</Button>
        </div>
    {/if}
</Wrapper>

<Table>
    <svelte:fragment slot="head">
        <TableHead>Liste</TableHead>
        <TableHead>Assemblage de base</TableHead>
        <TableHead>Affaire</TableHead>
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#each data.lists as list}
            <TableRow>
                <TableCell><a href="/app/lists2/{list.id}">{list.name}</a></TableCell>
                <TableCell><AssemblyPreview assembly={list.expand?.assembly} /></TableCell>
                <TableCell>{list.expand?.project?.name}</TableCell>
            </TableRow>
        {/each}
    </svelte:fragment>
</Table>