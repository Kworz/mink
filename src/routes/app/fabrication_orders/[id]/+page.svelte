<script lang="ts">
    import { enhance } from "$app/forms";

    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import Button from "$lib/components/Button.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import RoundedLabel from "$lib/components/RoundedLabel.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { Trash, Wrench } from "@steeze-ui/heroicons";
    import type { PageData } from "./$types";
    export let data: PageData;

    let deleteConfirm = false;

    $: if(deleteConfirm) { setTimeout(() => deleteConfirm = false, 5000) };

</script>

<Wrapper>
    <h2>Ordre de fabrication <RoundedLabel>#{data.fabricationOrder.id}</RoundedLabel></h2>
    

    <p>Demandeur: <DetailLabel>{data.fabricationOrder.expand?.applicant.username}</DetailLabel>.</p>
    <p>Receveur: <DetailLabel>{data.fabricationOrder.expand?.receiver.username}</DetailLabel>.</p>
    <p>Date butoir: <DetailLabel>{data.fabricationOrder.end_date}</DetailLabel>.</p>

    <PillMenu>
        <PillMenuButton icon={Wrench} role="warning">Modifier l'ordre de fabrication</PillMenuButton>
        {#if deleteConfirm}
            <form action="?/deleteFabOrder" method="post" use:enhance>
                <PillMenuButton role="danger" icon={Trash}>Confirmer</PillMenuButton>
            </form>
        {:else}
            <PillMenuButton role="danger" icon={Trash} on:click={() => deleteConfirm = true}>Supprimer l'ordre de fabrication</PillMenuButton>
        {/if}
    </PillMenu>
</Wrapper>

<Wrapper class="mt-6">
    <h3 class="mb-4">Article à fabriquer</h3>
    
    <Flex items="center" justify="between">
        {#if data.fabricationOrder.expand?.article !== undefined}
            <ArticleRow article={data.fabricationOrder.expand?.article} />
        {/if}
        <h1 class="mr-12 text-zinc-500/50 dark:text-white/50">x {data.fabricationOrder.quantity}</h1>
    </Flex>
    
</Wrapper>

