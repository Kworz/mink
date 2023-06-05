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
    import type { ActionData, PageData } from "./$types";
    import FormInput from "$lib/components/FormInput.svelte";

    export let data: PageData;
    export let form: ActionData;

    let deleteConfirm = false;

    $: if(deleteConfirm) { setTimeout(() => deleteConfirm = false, 5000) };

</script>

<Wrapper>
    <h2>Ordre de fabrication <RoundedLabel>#{data.fabricationOrder.id}</RoundedLabel></h2>
    
    <p>Demandeur: <DetailLabel>{data.fabricationOrder.expand?.applicant.username}</DetailLabel>.</p>
    <p>Receveur: <DetailLabel>{data.fabricationOrder.expand?.receiver.username}</DetailLabel>.</p>
    <p>Date butoir: <DetailLabel>{data.fabricationOrder.end_date}</DetailLabel>.</p>
    <p>Statut: <DetailLabel>{data.fabricationOrder.state}</DetailLabel>.</p>

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

    <h3 class="mb-4 mt-6">Article à fabriquer</h3>
    
    <Flex items="center" justify="between">
        {#if data.fabricationOrder.expand?.article !== undefined}
            <ArticleRow article={data.fabricationOrder.expand.article} />
        {/if}
        <h1 class="mr-12 text-zinc-500/50 dark:text-white/50">x {data.fabricationOrder.quantity}</h1>
    </Flex>

    {#if ["started", "asked"].includes(data.fabricationOrder.state)}
        <form action="?/completeFabOrder" method="post" use:enhance class="mt-6 flex flex-row gap-4 items-end">
            {#if form?.completeFabOrder?.stores}
                <FormInput label="Stock de destination" name="store_in" labelMandatory type="select">
                    {#each form.completeFabOrder.stores as store}
                        <option value={store.id}>{store.name} / {store.location}</option>
                    {/each}
                </FormInput>

                <Button role="success">Ordre de fabrication terminé</Button>
            {:else}
                <Button>Valider l'odre de fabrication</Button>
            {/if}
        </form>
    {/if}
</Wrapper>

