<script>
    import { enhance } from "$app/forms";
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";

</script>
<h4>Mise en place de votre société</h4>

<form action="?/addCompanyDetails" method="post" use:enhance class="flex flex-col gap-4 mt-6">

    <FormInput label="Nom de votre société" name="companyName" type="text" required labelMandatory />
    <FormInput label="Adresse de votre société" name="companyAddress" type="text" required labelMandatory />

    <FormInput label="Taux de TVA par défaut" name="companyDefaultVat" type="number" required labelMandatory />

    <Button class="w-full">Créer la société</Button>

</form>