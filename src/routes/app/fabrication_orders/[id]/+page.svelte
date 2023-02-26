<script lang="ts">
    import { enhance } from "$app/forms";


    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import Button from "$lib/components/Button.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import RoundedLabel from "$lib/components/RoundedLabel.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import type { PageData } from "./$types";
    export let data: PageData;

</script>

<Flex items="center" gap={2} class="mb-3">
    <h2>Ordre de fabrication</h2>
    <RoundedLabel>#{data.fabricationOrder.id}</RoundedLabel>
</Flex>

<p>Demandeur: <DetailLabel>{data.fabricationOrder.expand?.applicant.username}</DetailLabel>.</p>
<p>Receveur: <DetailLabel>{data.fabricationOrder.expand?.receiver.username}</DetailLabel>.</p>
<p>Date butoir: <DetailLabel>{data.fabricationOrder.end_date}</DetailLabel>.</p>

<Flex class="mt-6">
    <Button size="small" borderColor="border-amber-500" hoverColor="hover:bg-amber-500">Modifier l'ordre de fabrication</Button>
    <form action="?/deleteFabOrder" method="post" use:enhance>
        <Button size="small" borderColor="border-red-500" hoverColor="hover:bg-red-500">Supprimer l'ordre de fabrication</Button>
    </form>
</Flex>

<h3 class="mt-6">Article a fabriquer</h3>

<Wrapper class="mt-6">
    
    {#if data.fabricationOrder.expand?.article !== undefined}
        <ArticleRow article={data.fabricationOrder.expand?.article} />
    {/if}
</Wrapper>

