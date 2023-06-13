<script lang="ts">

    import Wrapper from "$lib/components/Wrapper.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;

</script>


<Wrapper>

    <h2>{data.user?.username}</h2>
    <p>{data.user?.email}</p>

</Wrapper>