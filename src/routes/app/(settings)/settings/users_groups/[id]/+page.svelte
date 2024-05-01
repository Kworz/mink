<script lang='ts'>

    import DetailLabel from "$lib/components/generics/DetailLabel.svelte";
    import { _ } from "svelte-i18n";
    import type { ActionData, PageData } from "./$types";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import TableCellCheckbox from "$lib/components/generics/table/TableCellCheckbox.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import { permission } from "$lib/prisma-enums";
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { groupPermissions } from "$lib/permissions";

    export let data: PageData;
    export let form: ActionData;

    let selected: string[] = [];

    $: if(form != null) { invalidateAll(); }

</script>

<h1>Groupe: {data.group.name}</h1>
<p>Est administrateur: <DetailLabel>{$_('app.generic.boolean-other.' + data.group.admin)}.</DetailLabel></p>

<Table headers={[{ label: "Permission" }, { label: "Valeur" }]} class="mt-6 mb-8">

    {#each groupPermissions as permissionKey}
        {@const permissionValue = data.group[permissionKey]}
        <TableCell>{permissionKey}</TableCell>
        <TableCell>
            <form action="?/updatePermission" method="post" use:enhanceNoReset>
                <input type="hidden" name="permission_key" value="{permissionKey}">
                <FormInput type="select" name="permission_value" value={permissionValue} validateOnChange>
                    <option value="" selected={permissionValue === null}>—</option>
                    {#each Object.keys(permission) as permissionItem}
                        <option value={permissionItem}>{permissionItem}</option>
                    {/each}
                </FormInput>
            </form>
        </TableCell>
    {/each}
</Table>

<h2>{$_('app.generic.users')}</h2>

<Table headers={["selectAll", { label: "Nom d'utilisateur" }, { label: "Email" }, { label: "Date de création" }]} selectables={data.group.users.map(u => u.id)} bind:selected class="mt-6">
    {#each data.group.users as user}
        <TableCellCheckbox group={selected} value={user.id} />
        <TableCell>{user.username}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.created}</TableCell>
    {/each}
</Table>
