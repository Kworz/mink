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
    import { Wrench } from "@steeze-ui/heroicons";

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