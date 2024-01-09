<script lang="ts">
    import ArticleRow from "$lib/components/derived/article/ArticleRow.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import User from "$lib/components/derived/user/User.svelte";
    import { Eye, EyeSlash, PlusCircle } from "@steeze-ui/heroicons";
    
    import type { PageData } from "./$types";
    import EmptyData from "$lib/components/EmptyData.svelte";
    import { goto } from "$app/navigation";

    export let data: PageData;

    let displayCompleted = false;
    let displayCancelled = false;

    $: fabricationOrders = data.fabricationOrders.filter(fabOrder => {
        if (fabOrder.state === "completed") return displayCompleted;
        if (fabOrder.state === "cancelled") return displayCancelled;
        return true;
    });

</script>

<PillMenu>
    <PillMenuButton icon={PlusCircle} href="/app/scm/fabrication_orders/new">Créer un ordre de fabrication</PillMenuButton>
    <PillMenuButton icon={displayCancelled ? Eye : EyeSlash} click={() => displayCancelled = !displayCancelled}>{displayCancelled ? "Masquer" : "Afficher"} les annulés</PillMenuButton>
    <PillMenuButton icon={displayCompleted ? Eye : EyeSlash} click={() => displayCompleted = !displayCompleted}>{displayCompleted ? "Masquer" : "Afficher"} les terminés</PillMenuButton>
</PillMenu>

<h1>Ordres de fabrication</h1>

{#if fabricationOrders.length > 0}
    <Table embeded={true} headers={[{ label: "Article" }, { label: "Etat" }, { label: "Quantité" }, { label: "Projet" }, { label: "Demandeur" }, { label: "Receveur" }, { label: "Date de butoire" }]}> 

        {#each fabricationOrders as fabricationOrder}
            <TableCell>
                <a href="/app/scm/fabrication_orders/{fabricationOrder.id}">
                    <ArticleRow article={fabricationOrder.article} displayStock={false} />
                </a>
            </TableCell>
            <TableCell>{fabricationOrder.state}</TableCell>
            <TableCell>{fabricationOrder.quantity}</TableCell>
            <TableCell>
                {#if fabricationOrder.project !== null}
                    <a href="/app/scm/projects/{fabricationOrder.project.id}">{fabricationOrder.project.name}</a>
                {/if}
            </TableCell>
            <TableCell>
                {#if fabricationOrder.askedBy !== undefined}
                    <User user={fabricationOrder.askedBy} />
                {/if}
            </TableCell>
            <TableCell>
                {#if fabricationOrder.receiver !== undefined}
                    <User user={fabricationOrder.receiver} />
                {/if}
            </TableCell>
            <TableCell>{fabricationOrder.end_date}</TableCell>
        {/each}
    </Table>
{:else}
    <EmptyData on:click={() => goto("/app/scm/fabrication_orders/new")} />
{/if}

