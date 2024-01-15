<script lang="ts">
    import { enhance } from "$app/forms";
    import Button from "$lib/components/generics/Button.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import type { ActionData } from "./$types";

    export let form: ActionData;
</script>

<h4>Création du compte administrateur</h4>

{#if form?.error}<p class="my-2 text-red-500">{form?.error}</p>{/if}

<form action="?/createFirstAccount" method="post" use:enhance class="flex flex-col gap-6 mt-6">

    <FormInput label="Nom d'utilisateur" name="username" type="text" required required autocomplete="username" />
    <FormInput label="Adresse email" name="email" type="email" required required autocomplete="email" />
    <FormInput label="Mot de passe" name="password" type="password" required required autocomplete="new-password" />
    <FormInput label="Mot de passe (confirmation)" name="password_confirmation" type="password" required required autocomplete="new-password" />

    <Button class="w-full">Créer le compte</Button>

</form>