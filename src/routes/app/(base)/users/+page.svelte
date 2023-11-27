<script lang="ts">

    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import Table from "$lib/components/table2/Table.svelte";
    import TableCell from "$lib/components/table2/TableCell.svelte";
    import { Envelope, UserPlus } from "@steeze-ui/heroicons";
    import type { ActionData, PageData } from "./$types";
    import MenuSide from "$lib/components/appLayout/MenuSide.svelte";
    import { invalidateAll } from "$app/navigation";
    import { enhance } from "$app/forms";
    import FormInput from "$lib/components/FormInput.svelte";
    import Button from "$lib/components/Button.svelte";
    import Modal from "$lib/components/modal/Modal.svelte";
    import Date from "$lib/components/formatters/Date.svelte";

    let createUser = false;
    let showInvitations = false;

    export let data: PageData;
    export let form: ActionData;

    $: if(form != null) { invalidateAll(); setTimeout(() => form = null, 5000); }

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

{#if showInvitations}
    <Modal title="Invitations" on:close={() => showInvitations = false}>
    
        {#if form?.inviteUser.success}<p class="text-emerald-500">{form?.inviteUser.success}</p>{/if}
        {#if form?.inviteUser.error}<p class="text-red-500">{form?.inviteUser.error}</p>{/if}

        <form action="?/inviteUser" method="post" use:enhance class="flex flex-row items-end gap-4">
            <FormInput label="Email" labelMandatory name="email" type="email" class="grow" />
            <Button role="success">Envoyer l'invitation</Button>
        </form>

        {#if data.invitations.length > 0}
            <h4 class="mt-6">Invitations envoyées</h4>
    
            <Table headers={[{ label: "Email" }, { label: "Date d'expiration" }]} class="mt-6">
                {#each data.invitations as invitation}
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell><Date date={invitation.created.toISOString()} /></TableCell>
                {/each}
            </Table>
        {/if}
    </Modal>
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

