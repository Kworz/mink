<script lang="ts">

    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import User from "$lib/components/user/User.svelte";
    import { PlusCircle } from "@steeze-ui/heroicons";

    import type { ActionData, PageData } from "./$types";
    import FormInput from "$lib/components/FormInput.svelte";
    import Button from "$lib/components/Button.svelte";
    import { enhance } from "$app/forms";
    import Flex from "$lib/components/layout/flex.svelte";
    import MenuSide from "$lib/components/appLayout/MenuSide.svelte";
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";

    export let data: PageData;
    export let form: ActionData;

    let createProject = false;
    let showClosedProjects = false;

    $: browser && goto(`?showClosed=${showClosedProjects}`);

</script>

<svelte:head><title>Nomenclaturize — Affaires</title></svelte:head>

{#if createProject}
    <MenuSide closable on:close={() => createProject = false}>
        <form action="?/createProject" method="POST" use:enhance class="flex flex-col gap-4">
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
    </MenuSide>
{/if}

<h1>Affaires</h1>

<FormInput type="checkbox" name="" label="Afficher les affaires cloturées" bind:checked={showClosedProjects} />

<PillMenu>
    <PillMenuButton click={() => createProject = !createProject} icon={PlusCircle}>Créer une affaire</PillMenuButton>
</PillMenu>

<Table class="mt-6" headers={[
    { label: "Affaire" }, 
    (showClosedProjects) ? { label: "Cloturé" } : undefined, 
    { label: "Client" }, 
    { label: "Date de début" }, 
    { label: "Date de fin" }, 
    { label: "Utilisateurs" }
]}>
    {#each data.projects as project}
        <TableCell><a href="/app/scm/projects/{project.id}">{project.name}</a></TableCell>
        {#if showClosedProjects}
            <TableCell>{project.closed ? "Oui" : "Non"}</TableCell>
        {/if}
        <TableCell>{project.customer || "—"}</TableCell>
        <TableCell>{project.start_date}</TableCell>
        <TableCell>{project.end_date}</TableCell>
        <TableCell>
            <Flex gap={2}>
                {#each project.attached_users as attached_user}
                    <User user={attached_user.user} />
                {/each}
            </Flex>
        </TableCell>
    {/each}
</Table>
