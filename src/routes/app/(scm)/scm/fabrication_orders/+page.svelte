<script lang="ts">
    import ArticleRow from "$lib/components/derived/article/ArticleRow.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import User from "$lib/components/derived/user/User.svelte";
    import { Eye, EyeSlash, PlusCircle } from "@steeze-ui/heroicons";
    
    import type { PageData } from "./$types";

    export let data: PageData;

    let displayCompleted = false;
    let displayCancelled = false;

    $: filteredFabOrders = data.fabricationOrders.filter(fabOrder => {
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

{#if data.fabricationOrders.length === 0}

    <p class="text-orange-500">
        Aucun ordre de fabrication en cours.<br>
        Ajouter un ordre de fabrication en cliquant en haut à droite.
    </p>

{:else}
    <Table embeded={true} headers={[{ label: "Article" }, { label: "Etat" }, { label: "Quantité" }, { label: "Projet" }, { label: "Demandeur" }, { label: "Receveur" }, { label: "Date de butoire" }]}> 

        {#each filteredFabOrders as fabOrder}
            <TableCell>
                <a href="/app/scm/fabrication_orders/{fabOrder.id}">
                    {#if fabOrder.expand?.article !== undefined}
                        <ArticleRow article={fabOrder.expand.article} displayStock={false} />
                    {:else}
                        —
                    {/if}
                </a>
            </TableCell>
            <TableCell>{fabOrder.state}</TableCell>
            <TableCell>{fabOrder.quantity}</TableCell>
            <TableCell>
                {#if fabOrder.expand?.project !== undefined}
                    <a href="/app/scm/projects/{fabOrder.expand?.project?.id}">{fabOrder.expand?.project.name}</a>
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
        {/each}
    </Table>
{/if}

