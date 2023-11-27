<script lang="ts">

    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import Table from "$lib/components/table2/Table.svelte";
    import TableCell from "$lib/components/table2/TableCell.svelte";
    import { UserPlus } from "@steeze-ui/heroicons";
    import type { ActionData, PageData } from "./$types";
    import MenuSide from "$lib/components/appLayout/MenuSide.svelte";
    import { invalidateAll } from "$app/navigation";
    import { enhance } from "$app/forms";
    import FormInput from "$lib/components/FormInput.svelte";
    import Button from "$lib/components/Button.svelte";

    let createUser = false;
    export let data: PageData;
    export let form: ActionData;

    $: if(form != null) { invalidateAll(); }

</script>

{#if createUser}
    <MenuSide closable on:close={() => createUser = false}>
    
        <h3 class="mb-4">Créer un utilisateur</h3>

        <form action="?/createUser" method="post" use:enhance class="flex flex-col gap-4">
        
            <FormInput label="Nom d'utilisateur" labelMandatory name="username" />
            <FormInput label="Email" labelMandatory name="email" type="email" />

            <Button role="success">Créer</Button>
        </form>
    
    </MenuSide>
{/if}

<h1>Liste des utilisateurs</h1>
<p>Liste des utilisateurs de votre organisation</p>

<PillMenu>
    <PillMenuButton click={() => createUser = !createUser} icon={UserPlus}>Créer un utilisateur</PillMenuButton>
</PillMenu>

<Table headers={[{ label: "Nom d'utilisateur" }, { label: "Email" }, { label: "Rôle" }]} class="mt-6">
    {#each data.users as user}
        <TableCell><a href="/app/users/{user.id}">{user.username}</a></TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.role}</TableCell>
    {/each}
</Table>

