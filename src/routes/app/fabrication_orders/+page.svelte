<script lang="ts">
    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import User from "$lib/components/user/User.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { PlusCircle } from "@steeze-ui/heroicons";
    
    import { goto } from "$app/navigation";
    import type { PageData } from "./$types";
    import FormInput from "$lib/components/FormInput.svelte";

    export let data: PageData;

    let displayCompleted = false;
    let displayCancelled = false;

    $: filteredFabOrders = data.fabricationOrders.filter(fabOrder => {
        if (fabOrder.state === "completed") return displayCompleted;
        if (fabOrder.state === "cancelled") return displayCancelled;
        return true;
    });

</script>


<Wrapper>
    <h2>Ordres de fabrication</h2>

    <FormInput name="" type="checkbox" label="Afficher les ordres de fabrication terminés" bind:checked={displayCompleted} />
    <FormInput name="" type="checkbox" label="Afficher les ordres de fabrication annulés" bind:checked={displayCancelled} />
    
    <PillMenu>
        <PillMenuButton icon={PlusCircle} href="/app/fabrication_orders/new">Créer un ordre de fabrication</PillMenuButton>
    </PillMenu>
    
    <Table embeded={true}>
        <svelte:fragment slot="head">
            <TableHead>Article demandé</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Projet</TableHead>
            <TableHead>Demandeur</TableHead>
            <TableHead>Receveur</TableHead>
            <TableHead>Date butoir</TableHead>
        </svelte:fragment>
        <svelte:fragment slot="body">
            {#each filteredFabOrders as fabOrder}
                <TableRow on:click={() => goto(`/app/fabrication_orders/${fabOrder.id}`)}>
                    <TableCell>
                        {#if fabOrder.expand?.article !== undefined}
                            <ArticleRow article={fabOrder.expand.article} displayStock={false} />
                        {:else}
                            —
                        {/if}
                    </TableCell>
                    <TableCell>{fabOrder.state}</TableCell>
                    <TableCell>{fabOrder.quantity}</TableCell>
                    <TableCell>
                        {#if fabOrder.expand?.project !== undefined}
                            <a href="/app/projects/{fabOrder.expand?.project?.id}">{fabOrder.expand?.project.name}</a>
                        {/if}
                    </TableCell>
                    <TableCell>
                        {#if fabOrder.expand?.applicant !== undefined}
                            <User user={fabOrder.expand.applicant} />
                        {/if}
                    </TableCell>
                    <TableCell>
                        {#if fabOrder.expand?.receiver !== undefined}
                            <User user={fabOrder.expand.receiver} />
                        {/if}
                    </TableCell>
                    <TableCell>{fabOrder.end_date}</TableCell>
                </TableRow>
            {:else}
                <TableRow>
                    <TableCell>Aucun ordre de fabrication en cours</TableCell>
                </TableRow>
            {/each}
        </svelte:fragment>
    </Table>
</Wrapper>
