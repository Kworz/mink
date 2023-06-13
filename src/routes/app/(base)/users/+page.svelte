<script lang="ts">

    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import { UserPlus } from "@steeze-ui/heroicons";
    import type { ActionData, PageData } from "./$types";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
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

<Wrapper>
    <h2>Liste des utilisateurs</h2>
    <p>Liste des utilisateurs de votre organisation</p>

    <PillMenu>
        <PillMenuButton click={() => createUser = !createUser} icon={UserPlus}>Créer un utilisateur</PillMenuButton>
    </PillMenu>

</Wrapper>

<Table>
    <svelte:fragment slot="head">
        <TableHead>Nom d'utilisateur</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Role</TableHead>
    </svelte:fragment>
    <svelte:fragment slot="body">
        {#each data.users as user}
            <TableRow>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
            </TableRow>
        {/each}
    </svelte:fragment>
</Table>

