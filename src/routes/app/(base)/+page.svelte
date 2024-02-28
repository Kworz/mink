<script lang="ts">
    import { page } from "$app/stores";
</script>

<h1>Accueil</h1>
<p>
    Bienvenue {$page.data.user?.username}!
    Utilisez le menu de droite pour accéder aux différents modules.
</p>
