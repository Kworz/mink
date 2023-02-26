<script lang="ts">
    import { goto } from "$app/navigation";

    
    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import Button from "$lib/components/Button.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import User from "$lib/components/user/User.svelte";
    
    import type { PageData } from "./$types";

    export let data: PageData;

</script>

<h2>Ordres de fabrication</h2>
<p>List contenant tout les ordres de fabrication.</p>

<Flex gap={6} class="mt-6">
    <a href="/app/fabrication_orders/new"><Button>Créer un ordre de fabrication</Button></a>
</Flex>

<Table>
    <svelte:fragment slot="head">
        <TableHead>Article demandé</TableHead>
        <TableHead>Quantité</TableHead>
        <TableHead>Demandeur</TableHead>
        <TableHead>Receveur</TableHead>
        <TableHead>Date butoir</TableHead>
    </svelte:fragment>
    <svelte:fragment slot="body">
        {#each data.fabricationOrders as fabOrder}
            <TableRow on:click={() => goto(`/app/fabrication_orders/${fabOrder.id}`)}>
                <TableCell>
                    {#if fabOrder.expand?.article !== undefined}
                        <ArticleRow article={fabOrder.expand.article} displayStock={false} />
                    {:else}
                        —
                    {/if}
                </TableCell>
                <TableCell>{fabOrder.quantity}</TableCell>
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
        {/each}
    </svelte:fragment>
</Table>