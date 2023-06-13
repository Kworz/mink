<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { Plus, PlusCircle } from "@steeze-ui/heroicons";
    import type { ActionData, PageData } from "./$types";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import InterestLabel from "../interests/InterestLabel.svelte";

    export let data: PageData;
    export let form: ActionData;

    let createLead = false;

    $: if(form !== null) { invalidateAll(); };

</script>

<Wrapper>
    <h3>Leads</h3>
    <p>Listes des pistes commerciales</p>

    <PillMenu>
        <PillMenuButton icon={PlusCircle} click={() => createLead = !createLead}>Créer une piste</PillMenuButton>
    </PillMenu>
</Wrapper>

<Table>

    <svelte:fragment slot="head">
        <TableHead>Société</TableHead>
        <TableHead>Statut</TableHead>
        <TableHead>Contact</TableHead>
        <TableHead>Intérets</TableHead>
        <TableHead>Origine</TableHead>
        <TableHead>Commentaire</TableHead>
    </svelte:fragment>

    <svelte:fragment slot="body">

        {#each data.leads as lead}
            <TableRow>
                <TableCell>
                    <h5>{lead.expand?.company.name}</h5>
                    <span class="text-sm text-zinc-500 block">{[lead.expand?.company.field, lead.expand?.company.sector, lead.expand?.company.type].filter(l => l != "").join(" / ")}</span>
                    <span class="text-sm text-zinc-500 block">Pays: {lead.expand?.company.country}</span>                    
                </TableCell>
                <TableCell>{lead.state || "—"}</TableCell>
                <TableCell>{lead.company_contacts}</TableCell>
                <TableCell>
                    {#each lead.expand?.["crm_leads_interests(lead)"] ?? [] as interest}
                        <InterestLabel interest={interest.expand?.interest} />
                    {/each}
                </TableCell>
                <TableCell>{lead.origin}</TableCell>
                <TableCell>{lead.comment}</TableCell>
            </TableRow>
        {/each}
    </svelte:fragment>
</Table>