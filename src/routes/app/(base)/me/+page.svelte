<script lang="ts">
    import type { ActionData } from "./$types";
    import { page } from "$app/stores";
    import { enhanceNoReset } from "$lib/enhanceNoReset"; 
    import { _ } from "svelte-i18n";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import Button from "$lib/components/generics/Button.svelte";

    export let form: ActionData;

    $: if(form?.updateUser?.success !== undefined) { setTimeout(() => form = null, 3000) };
    $: if(form?.updateUserSettings?.success !== undefined) { setTimeout(() => form = null, 3000) };
</script>

<svelte:head><title>{$page.data.user?.username} - {$_('app.generic.user')} - mink</title></svelte:head>

<h1>{$_('app.generic.user')}: {$page.data.user?.username}</h1>

<h2>{$_('app.user.personal_parameters')}</h2>

{#if form !== null && form.updateUser !== undefined}
    {#if "error" in form.updateUser}
        <p class="text-red-500 font-medium">{$_(form.updateUser.error)}</p>
    {:else}
        <p class="text-emerald-500">{$_('app.user.updated_personal_parameters')}</p>
    {/if}
{/if}

<form action="?/updateUser" method="post" use:enhanceNoReset class="*:mt-4">
    <FormInput name="username" value={$page.data.user?.username} label={$_('app.generic.username')} required />
    <FormInput name="email" value={$page.data.user?.email} label={$_('app.generic.email_address')} type="email" autocomplete="current_email" required />

    <Button role="warning" size="small">{$_('app.user.update_personal_parameters')}</Button> 
</form>

<h2 class="mt-4">{$_('app.user.mink_personal_parameters')}</h2>

<form action="?/updateUserSettings" method="post" use:enhanceNoReset class="w-fit *:mt-4">

    <FormInput type="select" name="app_language" value={$page.data.userSettings?.app_language} label={$_('app.generic.lang')} required validateOnChange>
        <option value="fr">Français</option>
        <option value="en">English</option>
    </FormInput>

    <FormInput name="app_menu_left" checked={$page.data.userSettings?.app_menu_left} label={$_('app.settings.keys.app_menu_left')} type="checkbox" validateOnChange />
    <FormInput name="app_pages_top_of_table" checked={$page.data.userSettings?.app_pages_top_of_table} label={$_('app.settings.keys.app_pages_top_of_table')} type="checkbox" validateOnChange />
</form>