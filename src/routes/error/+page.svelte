<script lang="ts">
    import { page } from "$app/stores";

    let data: { error: string, message: string } | null = null;

    $: data = $page.url.searchParams.has("error") ? JSON.parse(decodeURIComponent($page.url.searchParams.get("error")!)) : null;
</script>

<main class="p-8">
    <h1 class="text-red-500">{data?.error || "Erreur"}</h1>
    <p>{data?.message || "Internal error"}</p>

    <a href="/app" class="mt-4">Retour à l'accueil</a>
</main>
