<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import type { ActionData, PageData } from "./$types";
    import { Temporal } from "@js-temporal/polyfill";
    import { browser } from "$app/environment";
    import Table from "$lib/components/table/Table.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import User from "$lib/components/user/User.svelte";
    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import { ArrowRight, Wrench } from "@steeze-ui/heroicons";
    import Price from "$lib/components/formatters/Price.svelte";
    import Store from "$lib/components/store/Store.svelte";
    import { Icon } from "@steeze-ui/svelte-icon";

    export let data: PageData;
    export let form: ActionData;

    let editProject = false;

    $: if(form !== null && browser) { invalidateAll(); editProject = false; };

</script>

<Wrapper>
    {#if !editProject}
        <section>
            <h2>{data.project.name}</h2>
            <h5 class="mb-2">Client: {data.project.customer}</h5>
            
            <p>Date de début: <DetailLabel>{data.project.start_date}</DetailLabel>.</p>
            <p>Date de fin: <DetailLabel>{data.project.end_date}</DetailLabel>.</p>
            <p>Affaire cloturée: <DetailLabel>{data.project.closed ? "Oui" : "Non"}</DetailLabel>.</p>
    
            <PillMenu>
                <PillMenuButton icon={Wrench} click={() => editProject = !editProject}>Modifier l'affaire</PillMenuButton>
            </PillMenu>

        </section>
    {:else}
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
    {/if}
</Wrapper>

{#if data.fabricationOrders.length > 0}
    <Wrapper class="mt-6">
        <h3>Ordres de fabrication</h3>

        <Table class="self-start" embeded={true}>
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
    </Wrapper>
{/if}

{#if data.order_rows.length > 0}
    <Wrapper class="mt-6">
        <h3>Flux de commandes</h3>
    
        <Table embeded marginTop="">
            <svelte:fragment slot="head">
                <TableHead>Article</TableHead>
                <TableHead>Commande</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Prix total</TableHead>
            </svelte:fragment>
    
            <svelte:fragment slot="body">
                {#each data.order_rows as order_row}
                    <TableRow>
                        <TableCell><ArticleRow article={order_row.expand?.article} /></TableCell>
                        <TableCell><a href="/app/scm/orders/{order_row.order}">{order_row.expand?.order.name}</a></TableCell>
                        <TableCell>{order_row.quantity}</TableCell>
                        <TableCell><Price value={order_row.quantity * (order_row.ack_price ?? 0)} /></TableCell>
                    </TableRow>
                {/each}
            </svelte:fragment>
    
            <svelte:fragment slot="foot">
                <TableRow>
                    <TableCell colspan={3}>Total flux de commandes</TableCell>
                    <TableCell>
                        <Price value={data.order_rows.reduce((acc, row) => acc + (row.quantity * (row.ack_price ?? 0)), 0)} />
                    </TableCell>
                </TableRow>
            </svelte:fragment>
        </Table>
    </Wrapper>
{/if}

{#if data.stores_relations.length > 0}
    <Wrapper class="mt-6">
        <h3>Sorties de stock</h3>
    
        <Table embeded marginTop="">
            <svelte:fragment slot="head">
                <TableHead>Article</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Movement</TableHead>
                <TableHead>Prix</TableHead>
            </svelte:fragment>
    
            <svelte:fragment slot="body">
                {#each data.stores_relations as store_relation}
                    <TableRow>
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
                    </TableRow>
                {/each}
            </svelte:fragment>
    
            <svelte:fragment slot="foot">
                <TableRow>
                    <TableCell colspan={3}>Total flux sortie de stock</TableCell>
                    <TableCell>
                        <Price value={data.stores_relations.reduce((acc, sr) => acc + (Math.abs(sr.quantity_update) * (((sr.expand?.article.expand?.["article_price(article)"]?.at(0)?.price) ?? sr.expand?.article.price) ?? 0)), 0)} />
                    </TableCell>
                </TableRow>
            </svelte:fragment>
        </Table>
    </Wrapper>
{/if}
