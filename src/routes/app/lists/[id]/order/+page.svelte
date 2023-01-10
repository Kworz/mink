<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Table from "$lib/components/Table.svelte";
    import type { PageData } from "./$types";

    import { Icon } from "@steeze-ui/svelte-icon";
    import { ExclamationTriangle } from "@steeze-ui/heroicons";
    import type { NomenclatureRowResponse } from "$lib/DBTypes";
    import { page } from "$app/stores";

    import jspdf from "jspdf";
    import { browser } from "$app/environment";

    export let data: PageData;

    let orderDOM: HTMLDivElement;
    let controlDom: HTMLDivElement;
    
    let supplierFilter: string | undefined = undefined;

    let sum: number | undefined = undefined;

    const generatePDF = async () => {

        controlDom.style.aspectRatio = `${29.7 / 21}`;
        controlDom.style.width = "fit-content";

        if(orderDOM && browser)
        {
            const pdf = new jspdf('p', 'pt', 'A4', false);

            pdf.html(orderDOM, {
                margin: 12,
                html2canvas: {
                    scale: 0.5
                },
                callback: function (pdf) {
                    pdf.output("dataurlnewwindow");
                }
            });
        }

        controlDom.style.aspectRatio = "";
        controlDom.style.width = "";
    }

    const listRowFilter = (k: NomenclatureRowResponse, filter: string | undefined) => {

        const linked_row = data.list_rows.find(lr => lr.parent_nomenclature_row == k.id);

        if(linked_row?.quantity === k.quantity_required)
            return false;

        if(filter === undefined)
            return true;
        else
            return k.expand?.child_article.supplier === filter;
    };

    $: if(supplierFilter !== undefined) {

        const rows = data.nomenclature_rows.filter((k) => listRowFilter(k, supplierFilter));
        
        sum = rows.map(nr => {

            const lr = data.list_rows.find(lr => lr.parent_nomenclature_row == nr.id);

            const orderPrice = (nr.quantity_required - (lr?.quantity ?? 0)) * (nr.expand?.child_article.price ?? 0);

            return orderPrice;

        }).reduce((p, c) => p+c, 0);

    };

</script>

<div class="bg-zinc-100 border border-b-zinc-500/50 p-6" style="margin:-1.5rem; margin-bottom:1.5rem;">
    <h3 class="leading-10">Réglage commande</h3>

    <Flex>
        <select bind:value={supplierFilter} class="border rounded-sm border-zinc-500/50 p-2">
            {#each Array.from(new Set(data.nomenclature_rows.map(k => k.expand?.child_article.supplier))) as supplier}
                <option value={supplier} class="capitalize">{supplier}</option>
            {/each}
        </select>

        <Button on:click={generatePDF}>Générer le PDF</Button>
    </Flex>
</div>

<div bind:this={controlDom}>
    <div class="p-2 -m-2" bind:this={orderDOM}>
        <h2>Commande: <span contenteditable>XX</span></h2>
        <p>Numéro d'affaire: <span class="text-violet-500 font-medium">{data.list.name}</span>.</p>
        <p>Affaire suivie par: 
            <span class="text-violet-500 font-medium capitalize">{$page.data.user?.username}</span>
            <span class="text-violet-500 lowercase">({$page.data.user?.email})</span>.
        </p>
        
        <Table>
            <svelte:fragment slot="head">
                <tr>
                    <th>Article</th>
                    <th>Référence</th>
                    <th>Quantité</th>
                    <th>Prix unitaire (HT)</th>
                    <th>Prix total (HT)</th>
                </tr>
            </svelte:fragment>
        
            <svelte:fragment slot="body">
                {#if data.nomenclature_rows.length > 0}
                    {#each data.nomenclature_rows.filter((k) => listRowFilter(k, supplierFilter)) as row}
                    
                        {@const linked_row = data.list_rows.find(k => k.parent_nomenclature_row === row.id)}
                        {@const remainingQuantity = row.quantity_required - (linked_row?.quantity ?? 0)}
        
                        <tr>    
                            <td>{row.expand?.child_article.name}</td>
                            <td>{row.expand?.child_article.reference}</td>
                            <td>{row.quantity_required - (linked_row?.quantity ?? 0)}</td>
                            <td>{row.expand?.child_article.price} €</td>
                            <td>
                                {(remainingQuantity * (row.expand?.child_article.price)) ? remainingQuantity * (row.expand?.child_article.price) : "—"} €
                            </td>
                        </tr>
                    {/each}
                {:else}
                    <p class="p-6 font-medium text-lg">
                        <Icon src={ExclamationTriangle} theme="solid" class="h-10 w-10 mr-2 text-orange-500 inline"/>
                        Aucun élément présent dans la nomenclature.
                    </p>
                {/if}
            </svelte:fragment>

            <svelte:fragment slot="foot">

                <tr style="border-top-color: rgb(139,92,246); border-top-width: 2px;">
                    <td colspan={4}>Total HT</td>
                    <td>{sum} €</td>
                </tr>
                <tr>
                    <td colspan={4}>TVA</td>
                    <td>20%</td>
                </tr>
                <tr>
                    <td colspan={4}>Total TTC</td>
                    <td> {((sum ?? 0) * 1.20)} €</td>
                </tr>

            </svelte:fragment>
        </Table>
    </div>
</div>

<style>

    th {
        @apply p-4 border-b border-b-violet-500/75 text-left;
    }

    td {

        @apply p-4 border-b border-b-violet-500/25;
    }

    tr:last-child > td{
        @apply border-0;
    }

    td[colspan]
    {
        text-align: right;
        font-weight: 600;
    }


</style>