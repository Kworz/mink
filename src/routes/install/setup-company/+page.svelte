<script>
    import { enhance } from "$app/forms";
    import Button from "$lib/components/generics/Button.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";

</script>
<h4>Mise en place de votre société</h4>

<form action="?/addCompanyDetails" method="post" use:enhance class="flex flex-col gap-4 mt-6">

    <FormInput label="Nom de votre société" name="company_name" type="text" required required autocomplete="organization" />

    <h5>Adresse</h5>

    <FormInput label="Nom de rue" name="company_road" type="text" required required autocomplete="address-line1" />
    <FormInput label="Code postal" name="company_postal_code" type="text" required required autocomplete="postal-code" />
    <FormInput label="Ville" name="company_city" type="text" required required autocomplete="address-level2" />
    <FormInput label="Pays" name="company_country" type="text" required required autocomplete="country" />

    <h5>Fiscalité</h5>

    <FormInput label="Taux de TVA par défaut" name="company_default_vat" type="number" required required />

    <Button class="w-full">Créer la société</Button>

</form>