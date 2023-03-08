<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
import DetailLabel from "$lib/components/DetailLabel.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import type { ActionData, PageData } from "./$types";
    import { Temporal } from "@js-temporal/polyfill";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import Table from "$lib/components/table/Table.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import User from "$lib/components/user/User.svelte";
    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import OrderTable from "../../orders/OrderTable.svelte";

    export let data: PageData;
    export let form: ActionData;

    let editProject = false;

    $: if(form !== undefined && browser) { invalidateAll(); }

</script>

{#if !editProject}
    <section>
        <h2>{data.project.name}</h2>
        
        <p>Date de début: <DetailLabel>{data.project.start_date}</DetailLabel>.</p>
        <p>Date de fin: <DetailLabel>{data.project.end_date}</DetailLabel>.</p>

        <Button on:click={() => editProject = true} class="mt-6" size="small">Modifier le projet</Button>
    </section>
{:else}
    <form action="?/editProject" method="post" use:enhanceNoReset class="flex flex-col gap-2">
        <FormInput name="name" label="Nom du projet" labelMandatory={true} bind:value={data.project.name} />
        <FormInput type="date" name="start_date" label="Date de début de projet" labelMandatory={true} value={Temporal.Instant.from(data.project.start_date).toZonedDateTimeISO('UTC').toPlainDate().toString()} />
        <FormInput type="date" name="end_date" label="Date de fin de projet" labelMandatory={true} value={Temporal.Instant.from(data.project.end_date).toZonedDateTimeISO('UTC').toPlainDate().toString()} />

        <Flex class="mt-2">
            <Button size="small" borderColor="border-amber-500" hoverColor="hover:bg-amber-500">Valider les modifications</Button>
            <Button on:click={() => editProject = false} size="small" borderColor="border-red-500" hoverColor="hover:bg-red-500">Annuler les modifications</Button>
        </Flex>
    </form>
{/if}

<div class="h-[1px] w-full bg-zinc-500/25 my-4"></div>

<div class="grid grid-cols-1 gap-6">

    <h2>Listes d'achats</h2>

    <Table class="self-start" marginTop="">
        <svelte:fragment slot="head">
            <TableHead>Liste</TableHead>
            <TableHead>Date de création</TableHead>
        </svelte:fragment>
        <svelte:fragment slot="body">
            {#each data.lists as list}
                <TableRow>
                    <TableCell><a href="/app/lists/{list.id}">{list.name}</a></TableCell>
                    <TableCell>{list.created}</TableCell>
                </TableRow>
            {/each}
        </svelte:fragment>
    </Table>

    <h2>Ordres de fabrication</h2>

    <Table class="self-start" marginTop="">
        <svelte:fragment slot="head">
            <TableHead>Article demandé</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Demandeur</TableHead>
            <TableHead>Receveur</TableHead>
            <TableHead>Date butoir</TableHead>
        </svelte:fragment>
        <svelte:fragment slot="body">
            {#each data.fabricationOrders as fabOrder}
                <TableRow>
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

    <h2>Commandes</h2>

    <OrderTable bind:orders={data.orders} />

</div>