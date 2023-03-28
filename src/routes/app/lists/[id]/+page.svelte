<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import AssemblyPreview from "$lib/components/assemblies/AssemblyPreview.svelte";
    import Button from "$lib/components/Button.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import { clientSideFilter, type FilterCondition } from "$lib/components/filter/filter2";
    import Filter2 from "$lib/components/filter/Filter2.svelte";
    import Price from "$lib/components/formatters/Price.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { Check } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";

    import type { ActionData, PageData } from "./$types";
    
    export let data: PageData;
    export let form: ActionData;

    let filters: Array<FilterCondition> = [];
    let filter: string = "";

    $: flatenRelations = data.flattenAssemblyResult.map((far) => {
        return {
            far: far,
            buyListRelation: data.listItems.find(k => k.article === far.article.id)
        }
    });

    $: if(form !== null) { filter = ""; invalidateAll(); }

</script>

<Wrapper>
    <h3 class="mb-3">{data.list.name}</h3>
    <p>Affaire: <DetailLabel>{data.list.expand.project?.name}</DetailLabel>.</p>
    <p>Assemblage de base: <DetailLabel>{data.list.expand.assembly?.name}</DetailLabel>.</p>
    <p>Manquant pour finaliser: <DetailLabel><Price value={flatenRelations.reduce((p, c) => p + ((c.far.article?.price ?? 0) * (c.far.quantity - (c.buyListRelation?.quantity ?? 0))), 0)}/></DetailLabel>.</p>
</Wrapper>

<Wrapper class="mt-6">
    <Filter2 bind:filter bind:filters availableFilters={[{name: "name", default: true}, {name: "quantity"}, { name: "manufacturer"}, { name: "supplier.name" }, { name: "valid"}]} />
    <Table embeded={true}>
        <svelte:fragment slot="head">
            <TableHead>Article</TableHead>
            <TableHead>Sous assemblages</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Quantité nécessaire</TableHead>
            <TableHead>Prix restant</TableHead>
            <TableHead>Validé ?</TableHead>
        </svelte:fragment>
        <svelte:fragment slot="body">
            {#each flatenRelations.filter((element) => clientSideFilter(filters, {...element.far.article, quantity: element.far.quantity, valid: (element.buyListRelation?.quantity ?? 0) >= element.far.quantity })) as far}

                <TableRow>
                    <TableCell><ArticleRow article={far.far.article} displayStock displayApprox /></TableCell>
                    <TableCell>
                        <Flex direction={far.far.subAssemblies.length > 1 ? "row" : "col"} gap={2}>
                            {#each far.far["subAssemblies"] as assembly}
                                <AssemblyPreview {assembly} imageSize="h-10" minimized={far.far.subAssemblies.length > 1}/>
                            {/each}
                        </Flex>
                    </TableCell>
                    <TableCell>
                        <form action="?/buyListRelationEdit" method="post" use:enhanceNoReset class="flex gap-4 items-center">
                            <input type="hidden" name="article" value={far.far.article.id} />
                            <input type="hidden" name="buylist" value={data.list.id} />
                            <FormInput name="quantity" type="number" value={far.buyListRelation?.quantity ?? 0} max={far.far.quantity} />
                            <Button size="small"><Icon src={Check} class="h-4 w-4"/></Button>
                        </form>
                    </TableCell>
                    <TableCell>{far.far.quantity}</TableCell>
                    <TableCell><Price value={(far.far.quantity - (far.buyListRelation?.quantity ?? 0)) * (far.far.article.price ?? 0)} /></TableCell>
                    <TableCell>
                        {@const isValid = far.far.quantity <= (far.buyListRelation?.quantity ?? 0)}
                        <span class="font-semibold {isValid ? "text-emerald-500" : "text-red-500"}">{isValid ? "Oui" : "Non"}</span>
                    </TableCell>
                </TableRow>
            {/each}
        </svelte:fragment>
    </Table>
</Wrapper>