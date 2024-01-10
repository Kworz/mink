<script lang="ts">
    import { browser } from "$app/environment";
    import { invalidateAll } from "$app/navigation";
    import ArticleRow from "$lib/components/derived/article/ArticleRow.svelte";
    import User from "$lib/components/derived/user/User.svelte";
    import Button from "$lib/components/generics/Button.svelte";
    import DetailLabel from "$lib/components/generics/DetailLabel.svelte";
    import Price from "$lib/components/generics/formatters/Price.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import MenuSide from "$lib/components/generics/menu/MenuSide.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import TableFootCell from "$lib/components/generics/table/TableFootCell.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { Wrench } from "@steeze-ui/heroicons";
    import type { ActionData, PageData } from "./$types";

    export let data: PageData;
    export let form: ActionData;

    let editProject = false;

    $: if(form !== null && browser) { invalidateAll(); editProject = false; };

</script>

{#if editProject}
    <MenuSide on:close={() => editProject = false}>
        <form action="?/editProject" method="post" use:enhanceNoReset class="flex flex-col gap-2">
            <FormInput name="name" label="Nom du projet" labelMandatory bind:value={data.project.name} />
            <FormInput name="customer" label="Client du projet" bind:value={data.project.customer} />
            <FormInput type="checkbox" name="closed" label="Affaire cloturée" bind:checked={data.project.closed} />
            <FormInput type="date" name="start_date" label="Date de début de projet" labelMandatory={true} value={data.project.start_date?.toISOString()} />
            <FormInput type="date" name="end_date" label="Date de fin de projet" labelMandatory={true} value={data.project.end_date?.toISOString()} />
    
            <Flex class="mt-2">
                <Button size="small" role="warning">Valider les modifications</Button>
                <Button on:click={() => editProject = false} size="small" role="danger">Annuler les modifications</Button>
            </Flex>
        </form>
    </MenuSide>
{/if}

<PillMenu>
    <PillMenuButton icon={Wrench} click={() => editProject = !editProject}>Modifier l'affaire</PillMenuButton>
</PillMenu>

<h1>{data.project.name}</h1>
<h5 class="mb-2">Client: {data.project.customer}</h5>

<p>Date de début: <DetailLabel>{data.project.start_date}</DetailLabel>.</p>
<p>Date de fin: <DetailLabel>{data.project.end_date}</DetailLabel>.</p>
<p>Affaire cloturée: <DetailLabel>{data.project.closed ? "Oui" : "Non"}</DetailLabel>.</p>

{#if data.project.fabrication_orders.length > 0}
    <h2>Ordres de fabrication</h2>

    <Table class="self-start" headers={[{ label: "Article demandé" }, { label: "Quantité" }, { label: "Demandeur" }, { label: "Receveur" }, { label: "Date butoire" }]}>
        {#each data.project.fabrication_orders as fabricationOrder}
            <TableCell>
                {#if fabricationOrder.article !== undefined}
                    <ArticleRow article={fabricationOrder.article} displayStock={false} />
                {:else}
                    —
                {/if}
            </TableCell>
            <TableCell>{fabricationOrder.quantity}</TableCell>
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
{/if}

{#if data.project.order_rows.length > 0}
    <h2>Flux de commandes</h2>

    <Table headers={[{ label: "Article" }, { label: "Commande" }, { label: "Quantité" }, { label: "Prix total" }]}>
        {#each data.project.order_rows as order_row}
            <TableCell><ArticleRow article={order_row.article} /></TableCell>
            <TableCell><a href="/app/scm/orders/{order_row.order_id}">{order_row.order.name}</a></TableCell>
            <TableCell>{order_row.needed_quantity}</TableCell>
            <TableCell><Price value={order_row.needed_quantity * (order_row.ack_price ?? 0)} /></TableCell>
        {/each}

        <TableFootCell colspan={3}>Total flux de commandes</TableFootCell>
        <TableFootCell>
            <Price value={data.project.order_rows.reduce((acc, row) => acc + (row.needed_quantity * (row.ack_price ?? 0)), 0)} />
        </TableFootCell>
    </Table>
{/if}
