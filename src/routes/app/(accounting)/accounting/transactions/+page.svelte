<script lang="ts">
    import { enhance } from "$app/forms";
    import Button from "$lib/components/generics/Button.svelte";
</script>

<h1>Lien bancaire</h1>
<p>Créez un lien avec votre banque</p>

<form action="?/addBank" method="post" use:enhance>

    <Button>Ajouter une banque</Button>

</form>