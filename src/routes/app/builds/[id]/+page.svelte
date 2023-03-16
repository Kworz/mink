<script lang="ts">
    import NomenclatureNest from "$lib/components/nomenclature/nest/NomenclatureNest.svelte";
    import { computeNested } from "$lib/components/nomenclature/nest/nomenclatureNester";
import RoundedLabel from "$lib/components/RoundedLabel.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;

    $: nomenclatureNested = computeNested(data.nomenclature);

</script>

<Wrapper>
    <h2>Suivi assemblage <RoundedLabel>{data.build.name}</RoundedLabel>.</h2>
</Wrapper>

<Wrapper class="mt-6">

    {#each nomenclatureNested as nestGroup}
        <NomenclatureNest bind:nestGroup />
    {/each}

</Wrapper>