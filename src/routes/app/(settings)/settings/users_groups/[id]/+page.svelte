<script lang='ts'>

    import { _ } from "svelte-i18n";
    import type { ActionData, PageData } from "./$types";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import TableCellCheckbox from "$lib/components/generics/table/TableCellCheckbox.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import { permission } from "$lib/prisma-enums";
    import { invalidateAll } from "$app/navigation";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { groupPermissions } from "$lib/permission";
    import BooleanLabel from "$lib/components/derived/BooleanLabel.svelte";

    export let data: PageData;
    export let form: ActionData;

    let selected: string[] = [];

    $: if(form != null) { invalidateAll(); }

</script>

<svelte:head>
    <title>{data.group.name} - {$_('app.generic.user_group')} - mink</title>
</svelte:head>

<h1>{$_('app.generic.user_group')}: {data.group.name}</h1>

<p class="mt-2">{$_('app.permission.is_admin')} : <BooleanLabel value={data.group.admin} /></p>

{#if data.group.admin}
    <p class="text-orange-500 font-semibold my-2">{$_('app.settings.users_groups.admin_group_warning')}</p>
{:else}

    <p class="mb-2">{$_('app.settings.users_groups.update_permission', { values: { group: data.group.name }})}</p>

    <h2>{$_('app.generic.permissions')}</h2>

    <Table headers={[{ label: $_('app.generic.permission_zone') }, { label: $_('app.generic.permission') }]} class="mt-4 mb-6">

        {#each groupPermissions as permissionKey}
            {@const permissionValue = data.group[permissionKey]}
            <TableCell>{permissionKey}</TableCell>
            <TableCell>
                <form action="?/updatePermission" method="post" use:enhanceNoReset>
                    <input type="hidden" name="permission_key" value="{permissionKey}">
                    <FormInput type="select" name="permission_value" value={permissionValue} validateOnChange>
                        <option value="" selected={permissionValue === null}>—</option>
                        {#each Object.keys(permission) as permissionItem}
                            <option value={permissionItem}>{$_(`app.permission.${permissionItem}`)}</option>
                        {/each}
                    </FormInput>
                </form>
            </TableCell>
        {/each}
    </Table>

{/if}

<h2>{$_('app.generic.users')}</h2>

<Table headers={["selectAll", { label: $_('app.generic.username') }, { label: $_('app.generic.email_address') }, { label: $_('app.generic.creation_date') }]} selectables={data.group.users.map(u => u.id)} bind:selected class="mt-4">
    {#each data.group.users as user}
        <TableCellCheckbox group={selected} value={user.id} />
        <TableCell>{user.username}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.created}</TableCell>
    {/each}
</Table>
