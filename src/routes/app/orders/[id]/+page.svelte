<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Input from "$lib/components/Input.svelte";
    import Grid from "$lib/components/layout/grid.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";


    import type { ActionData, PageData } from "./$types";

    export let data: PageData;
    export let form: ActionData;

    $: htTotal = (data.order.expand?.["orders_rows(order)"].map(k => k.quantity * (k.expand?.article.price ?? 0)).reduce((p, c) => p + c, 0) ?? 0);
    $: tvaSubtotal = Math.floor(((htTotal * 1.20) - htTotal) * 100) / 100;
    $: completeTotal = htTotal + tvaSubtotal;
    
    
    $: if(form !== null) { invalidateAll() }

</script>

<Wrapper class="w-3/5 mx-auto aspect-A4 p-8">
    <h2>Commande <span class="px-3 py-1 rounded-full bg-biolet-500 font-medium">#{data.order.id}</span></h2>

    <Grid cols={2} gap={6}>
        <Table>
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
            </svelte:fragment>
        </Table>
        <Table>
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

    <Wrapper class="mt-6">Cette commande est suivie par <DetailLabel>{data.order.expand?.issuer.email}</DetailLabel>.</Wrapper>

    <Table>
        <svelte:fragment slot="head">
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
                {#each data.order.expand?.["orders_rows(order)"] as order_rows}
                    <TableRow>
                        <TableCell>{data.order.expand?.project.name}</TableCell>
                        <TableCell>{order_rows.expand?.article.name}</TableCell>
                        <TableCell>{order_rows.expand?.article.reference}</TableCell>
                        <TableCell>{order_rows.quantity}</TableCell>
                        <TableCell>{order_rows.delivery_date}</TableCell>
                        <TableCell>{order_rows.expand?.article.price || "—"} €</TableCell>
                        <TableCell>{((order_rows.expand?.article.price ?? 0) * order_rows.quantity) || "—"} €</TableCell>
                    </TableRow>
                {/each}
            {/if}
        </svelte:fragment>
    </Table>

    <Table class="w-auto ml-auto">
        <svelte:fragment slot="body">
            <TableRow>
                <TableCell>Total (HT)</TableCell>
                <TableCell>{htTotal} €</TableCell>
            </TableRow>
            <TableRow>
                <TableCell>TVA (20%)</TableCell>
                <TableCell>{tvaSubtotal} €</TableCell>
            </TableRow>
        </svelte:fragment>
        <svelte:fragment slot="foot">
            <TableRow>
                <TableCell>Total (TTC)</TableCell>
                <TableCell>{completeTotal} €</TableCell>
            </TableRow>
        </svelte:fragment>
    </Table>
</Wrapper>

