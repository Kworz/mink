<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import Price from "$lib/components/formatters/Price.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Grid from "$lib/components/layout/grid.svelte";
    import SidebarWrapper from "$lib/components/SidebarWrapper.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { OrdersStateOptions } from "$lib/DBTypes";
    import { enhanceNoReset } from "$lib/enhanceNoReset";

    import type { ActionData, PageData } from "./$types";

    let states = [OrdersStateOptions.draft, OrdersStateOptions.placed, OrdersStateOptions.cancelled]

    export let data: PageData;
    export let form: ActionData;

    let selectedRows: Array<string> = [];

    $: htTotal = (data.order.expand?.["orders_rows(order)"].map(k => k.quantity * (k.expand?.article.price ?? 0)).reduce((p, c) => p + c, 0) ?? 0);
    $: tvaSubtotal = Math.floor(((htTotal * 1.20) - htTotal) * 100) / 100;
    $: completeTotal = htTotal + tvaSubtotal;
    
    $: if(form !== null) { invalidateAll() }

</script>

<SidebarWrapper>
    <svelte:fragment slot="sidebar">
        <h2>Commande</h2>
        <p>Réglages de la commande</p>

        <form action="?/editOrder" method="post" use:enhanceNoReset class="flex flex-col gap-4 mt-6">
            <FormInput bind:value={data.order.name} name="name" label="Nom de la commande" labelMandatory={true} backgroundColor="bg-white" />
            <FormInput type="select" bind:value={data.order.state} name="state" label="État de la commande" labelMandatory={true} backgroundColor="bg-white">
                {#each states as state}
                    <option value={state} class="capitalize">{state}</option>
                {/each}
            </FormInput>
        </form>

    </svelte:fragment>

    <Wrapper class="w-4/5 mx-auto aspect-A4 p-8">
        <h2>Commande <span class="px-3 py-1 rounded-full bg-violet-500 text-white font-medium">{data.order.name}</span></h2>
    
        <Grid cols={2} gap={24} items="start">
            <Table backgroundColor="bg-white">
                <svelte:fragment slot="body">
                    <TableRow>
                        <TableCell><h3>Metalizz</h3></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <p>
                                840 Chemin de chabanne,
                                26270 Loriol sur drome
                            </p>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <DetailLabel>{data.order.expand?.issuer.email}</DetailLabel>
                        </TableCell>
                    </TableRow>
                </svelte:fragment>
            </Table>
            <Table backgroundColor="bg-white">
                <svelte:fragment slot="body">
                    <TableRow>
                        <TableCell><h3>{data.order.expand?.supplier.name}</h3></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><p>{data.order.expand?.supplier.address}</p></TableCell>
                    </TableRow>
                </svelte:fragment>
            </Table>
        </Grid>
    
        <Table backgroundColor="bg-white">
            <svelte:fragment slot="head">
                <TableHead>Selection</TableHead>
                <TableHead>Projet</TableHead>
                <TableHead>Désignation</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Délai</TableHead>
                <TableHead>Prix </TableHead>
                <TableHead>Total</TableHead>
            </svelte:fragment>
    
            <svelte:fragment slot="body">
                {#if data.order.expand?.["orders_rows(order)"]}
                    {#each data.order.expand?.["orders_rows(order)"] as order_row (order_row.id)}
                        <TableRow>
                            <TableCell><input type="checkbox" bind:group={selectedRows} value={order_row.id} /></TableCell>
                            <TableCell>
                                <form action="?/editOrderRow" method="post" use:enhanceNoReset>
                                    <input type="hidden" name="id" value={order_row.id} />
                                    <FormInput type="select" name="project" bind:value={order_row.project} validateOnChange={true}>
                                        <option value="">—</option>
                                        {#each data.projects as project}
                                            <option value={project.id}>{project.name}</option>
                                        {/each}
                                    </FormInput>
                                </form>
                            </TableCell>
                            <TableCell><a href="/app/articles/{order_row.expand?.article.id}" class="hover:text-violet-500 duration-200 font-medium">{order_row.expand?.article.name}</a></TableCell>
                            <TableCell>{order_row.expand?.article.reference}</TableCell>
                            <TableCell>
                                <form action="?/editOrderRow" method="post" use:enhanceNoReset>
                                    <input type="hidden" name="id" value={order_row.id} />
                                    <FormInput type="number" name="quantity" bind:value={order_row.quantity} validateOnChange={true} min={order_row.expand?.article?.order_quantity} step={order_row.expand?.article?.order_quantity}/>
                                </form>
                            </TableCell>
                            <TableCell>
                                <form action="?/editOrderRow" method="post" use:enhanceNoReset>
                                    <input type="hidden" name="id" value={order_row.id} />
                                    <FormInput type="date" name="delivery_date" value={order_row.delivery_date?.split(" ").at(0) ?? undefined} validateOnChange={true} />
                                </form>
                            </TableCell>
                            <TableCell><Price value={order_row.expand?.article.price ?? 0} /></TableCell>
                            <TableCell><Price value={((order_row.expand?.article.price ?? 0) * order_row.quantity)} /></TableCell>
                        </TableRow>
                    {/each}
                {/if}
            </svelte:fragment>
        </Table>
    
        <Table class="w-auto ml-auto" backgroundColor="bg-white">
            <svelte:fragment slot="body">
                <TableRow>
                    <TableCell>Total (HT)</TableCell>
                    <TableCell><Price value={htTotal} /></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>TVA (20%)</TableCell>
                    <TableCell><Price value={tvaSubtotal} /></TableCell>
                </TableRow>
            </svelte:fragment>
            <svelte:fragment slot="foot">
                <TableRow>
                    <TableCell>Total (TTC)</TableCell>
                    <TableCell><Price value={completeTotal} /></TableCell>
                </TableRow>
            </svelte:fragment>
        </Table>
    </Wrapper>
</SidebarWrapper>