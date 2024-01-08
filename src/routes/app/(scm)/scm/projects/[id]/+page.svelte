<script lang="ts">
    import { browser } from "$app/environment";
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/generics/Button.svelte";
    import DetailLabel from "$lib/components/generics/DetailLabel.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import Wrapper from "$lib/components/generics/containers/Wrapper.svelte";
    import MenuSide from "$lib/components/generics/menu/MenuSide.svelte";
    import ArticleRow from "$lib/components/derived/article/ArticleRow.svelte";
    import Price from "$lib/components/generics/formatters/Price.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import Store from "$lib/components/derived/store/Store.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import TableFootCell from "$lib/components/generics/table/TableFootCell.svelte";
    import User from "$lib/components/derived/user/User.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { Temporal } from "@js-temporal/polyfill";
    import { ArrowRight, Wrench } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
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
            <FormInput type="date" name="start_date" label="Date de début de projet" labelMandatory={true} value={Temporal.Instant.from(data.project.start_date).toZonedDateTimeISO('UTC').toPlainDate().toString()} />
            <FormInput type="date" name="end_date" label="Date de fin de projet" labelMandatory={true} value={Temporal.Instant.from(data.project.end_date).toZonedDateTimeISO('UTC').toPlainDate().toString()} />
    
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

{#if data.fabricationOrders.length > 0}
    <h3>Ordres de fabrication</h3>

    <Table class="self-start" headers={[{ label: "Article demandé" }, { label: "Quantité" }, { label: "Demandeur" }, { label: "Receveur" }, { label: "Date butoire" }]}>
        {#each data.fabricationOrders as fabOrder}
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
        {/each}
    </Table>
{/if}

{#if data.order_rows.length > 0}
    <h3>Flux de commandes</h3>

    <Table headers={[{ label: "Article" }, { label: "Commande" }, { label: "Quantité" }, { label: "Prix total" }]}>
        {#each data.order_rows as order_row}
            <TableCell><ArticleRow article={order_row.expand?.article} /></TableCell>
            <TableCell><a href="/app/scm/orders/{order_row.order}">{order_row.expand?.order.name}</a></TableCell>
            <TableCell>{order_row.quantity}</TableCell>
            <TableCell><Price value={order_row.quantity * (order_row.ack_price ?? 0)} /></TableCell>
        {/each}

        <TableFootCell colspan={3}>Total flux de commandes</TableFootCell>
        <TableFootCell>
            <Price value={data.order_rows.reduce((acc, row) => acc + (row.quantity * (row.ack_price ?? 0)), 0)} />
        </TableFootCell>
    </Table>
{/if}

{#if data.stores_relations.length > 0}
    <Wrapper class="mt-6">
        <h3>Sorties de stock</h3>
    
        <Table headers={[{ label: "Article" }, { label: "Quantité" }, { label: "Movement" }, { label: "Prix total" }]}>
            {#each data.stores_relations as store_relation}
                <TableCell><ArticleRow article={store_relation.expand?.article} displayManufacturer /></TableCell>
                <TableCell>{store_relation.quantity_update}</TableCell>
                <TableCell>
                    <Flex items="center">
                        <Store store={store_relation.expand?.store_out}/>
                        <Icon src={ArrowRight} class="h-4 w-4 text-violet-500" />
                        <Store store={store_relation.expand?.store_in} />
                    </Flex>
                </TableCell>
                <TableCell><Price value={(((store_relation.expand?.article.expand?.["article_price(article)"]?.at(0)?.price) ?? store_relation.expand?.article.price) ?? 0) * store_relation.quantity_update} /></TableCell>
            {/each}

            <TableFootCell colspan={3}>Total flux sortie de stock</TableFootCell>
            <TableFootCell>
                <Price value={data.stores_relations.reduce((acc, sr) => acc + (Math.abs(sr.quantity_update) * (((sr.expand?.article.expand?.["article_price(article)"]?.at(0)?.price) ?? sr.expand?.article.price) ?? 0)), 0)} />
            </TableFootCell>
        </Table>
    </Wrapper>
{/if}
