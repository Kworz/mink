<script lang="ts">

    import type { PageData } from "./$types";
    export let data: PageData;

</script>

<h1>Utilisateur: {data.user?.username}</h1>
<p>{data.user?.email}</p>
