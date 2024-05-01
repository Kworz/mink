<script lang="ts">

    import DetailLabel from "$lib/components/generics/DetailLabel.svelte";
    import type { PageData } from "./$types";
    export let data: PageData;

</script>

<h1>Utilisateur: {data.user?.username}</h1>
<p>{data.user?.email}</p>

<p>Groupe: <DetailLabel>{data.user.group?.name}</DetailLabel></p>

<!-- TODO: Add all stuff affected by this user -->
