<script lang="ts">

    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import User from "$lib/components/user/User.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { PlusCircle } from "@steeze-ui/heroicons";

    import type { ActionData, PageData } from "./$types";
    import FormInput from "$lib/components/FormInput.svelte";
    import Button from "$lib/components/Button.svelte";
    import { invalidateAll } from "$app/navigation";
    import { enhance } from "$app/forms";
    import Flex from "$lib/components/layout/flex.svelte";
    export let data: PageData;

    let createProject = false;
    let showClosedProjects = false;

    export let form: ActionData;

    $: if(form?.createProject.success) { invalidateAll(); };
    $: projects = data.projects.filter(p => (showClosedProjects ? true : p.closed === false));

</script>

<svelte:head><title>Nomenclaturize — Affaires</title></svelte:head>

<Wrapper>
    <h2>Affaires</h2>

    <FormInput type="checkbox" name="" label="Afficher les affaires cloturées" bind:checked={showClosedProjects} />

    <PillMenu>
        <PillMenuButton click={() => createProject = !createProject} icon={PlusCircle}>Créer une affaire</PillMenuButton>
    </PillMenu>

    {#if createProject}
        <form action="?/createProject" method="POST" use:enhance class="flex flex-row gap-4 items-end">
            <FormInput label="Nom de l'affaire" name="name" labelMandatory />
            <FormInput label="Client" name="customer" />
            <FormInput type="date" name="start_date" label="Date de début" labelManadatory />
            <FormInput type="date" name="end_date" label="Date de fin" labelManadatory />
            <FormInput type="select" name="attached_users" label="Utilisateurs" labelManadatory multiple value={[]}>
                {#each data.users as user}
                    <option value={user.id}>{user.username} ({user.email})</option>
                {/each}
            </FormInput>
            <Button role="success">Créer</Button>
        </form>
    {/if}

    <Table embeded={true} marginTop="mt-2">
        <svelte:fragment slot="head">
            <TableHead>Affaire</TableHead>
            {#if showClosedProjects}
                <TableHead>Cloturé ?</TableHead>
            {/if}
            <TableHead>Client</TableHead>
            <TableHead>Date de début</TableHead>
            <TableHead>Date de fin</TableHead>
            <TableHead>Utilisateurs</TableHead>
        </svelte:fragment>
    
        <svelte:fragment slot="body">
            {#each projects as project}
                <TableRow>
                    <TableCell><a href="/app/scm/projects/{project.id}">{project.name}</a></TableCell>
                    {#if showClosedProjects}
                        <TableCell>{project.closed ? "Oui" : "Non"}</TableCell>
                    {/if}
                    <TableCell>{project.customer || "—"}</TableCell>
                    <TableCell>{project.start_date}</TableCell>
                    <TableCell>{project.end_date}</TableCell>
                    <TableCell>
                        {#if project.expand?.attached_users !== undefined}
                            <Flex gap={2}>
                                {#each project.expand.attached_users as user}
                                    <User {user} />
                                {/each}
                            </Flex>
                        {/if}
                    </TableCell>
                </TableRow>
            {/each}
        </svelte:fragment>
    </Table>
</Wrapper>
