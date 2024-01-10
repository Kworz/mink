<script lang="ts">

    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/generics/Button.svelte";
    import Date from "$lib/components/generics/formatters/Date.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import Modal from "$lib/components/generics/modal/Modal.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import MenuSide from "$lib/components/generics/menu/MenuSide.svelte";
    import { Envelope, UserPlus } from "@steeze-ui/heroicons";
    import type { ActionData, PageData } from "./$types";

    let createUser = false;
    let showInvitations = false;

    export let data: PageData;
    export let form: ActionData;

    $: if(form != null) { invalidateAll(); setTimeout(() => form = null, 5000); }

</script>

{#if createUser}
    <MenuSide title="Créer un utilisateur" on:close={() => createUser = false}>
    
        <form action="?/createUser" method="post" use:enhance class="flex flex-col gap-4">
        
            <FormInput label="Nom d'utilisateur" labelMandatory name="username" />
            <FormInput label="Email" labelMandatory name="email" type="email" />

            <Button role="success">Créer</Button>
        </form>
    
    </MenuSide>
{/if}

{#if showInvitations}
    <MenuSide title="Invitations" on:close={() => showInvitations = false}>
    
        {#if form?.inviteUser && "success" in form.inviteUser}<p class="text-emerald-500">{form?.inviteUser.success}</p>{/if}
        {#if form?.inviteUser && "error" in form.inviteUser}<p class="text-red-500">{form?.inviteUser.error}</p>{/if}

        <form action="?/inviteUser" method="post" use:enhance class="flex flex-row items-end gap-4">
            <FormInput label="Email" labelMandatory name="email" type="email" class="grow" />
            <Button role="success">Envoyer l'invitation</Button>
        </form>

        {#if data.invitations.length > 0}
            <h4 class="mt-6">Invitations envoyées</h4>
    
            <Table headers={[{ label: "Email" }, { label: "Date d'expiration" }]} class="mt-6">
                {#each data.invitations as invitation}
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell><Date date={invitation.created} /></TableCell>
                {/each}
            </Table>
        {/if}
        </MenuSide>
{/if}

<h1>Liste des utilisateurs</h1>
<p>Liste des utilisateurs de votre organisation</p>

<PillMenu>
    <PillMenuButton click={() => createUser = !createUser} icon={UserPlus}>Créer un utilisateur</PillMenuButton>
    <PillMenuButton click={() => showInvitations = !showInvitations} icon={Envelope}>Invitations</PillMenuButton>
</PillMenu>

<Table headers={[{ label: "Nom d'utilisateur" }, { label: "Email" }, { label: "Rôle" }]} class="mt-6">
    {#each data.users as user}
        <TableCell><a href="/app/users/{user.id}">{user.username}</a></TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.role}</TableCell>
    {/each}
</Table>

