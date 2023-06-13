<script lang="ts">
    import { page } from "$app/stores";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import Grid from "$lib/components/layout/grid.svelte";
</script>

<Wrapper>

    <h1>Accueil</h1>
    <p>Bienvenue, {$page.data.user?.username}. Cliquez sur le menu de gauche pour utiliser Nomenclaturize.</p>

</Wrapper>