<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { Plus, PlusCircle } from "@steeze-ui/heroicons";
    import type { ActionData, PageData, Snapshot } from "./$types";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import InterestLabel from "../interests/InterestLabel.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import CompanyContact from "../companies/CompanyContact.svelte";
    import Filter2 from "$lib/components/filter/Filter2.svelte";
    import type { FilterCondition } from "$lib/components/filter/filter2";
    import { page } from "$app/stores";
    import { browser } from "$app/environment";
    import TablePages from "$lib/components/table/TablePages.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";

    export let data: PageData;
    export let form: ActionData;

    let createLead = false;

    let filters: Array<FilterCondition> = [];
    let filter: string = $page.url.searchParams.get("filter") ?? "";

    let activeSort = $page.url.searchParams.get("sort") ?? "-created";
    let itemsPage = Number($page.url.searchParams.get("page")) ?? 1;

    export const snapshot: Snapshot<Array<FilterCondition>> = {
        capture: () => filters,
        restore: (value) => filters = value
    }

    const triggerRefresh = () => {
        if(browser) {
            goto(`/app/crm/leads?sort=${activeSort}&page=${itemsPage}&filter=${filter}`, { noScroll: true });
        }
    }

    $: filter, activeSort, itemsPage, triggerRefresh();  
    
    $: if(form !== null) { invalidateAll(); };

</script>

<Wrapper>
    <h3>Leads</h3>
    <p>Listes des pistes commerciales</p>
    <p>Nombre de pistes: <DetailLabel>{data.leads.totalItems}</DetailLabel>.</p>

    <PillMenu>
        <PillMenuButton icon={PlusCircle} click={() => createLead = !createLead}>Créer une piste</PillMenuButton>
    </PillMenu>
</Wrapper>

<Wrapper class="mt-6">
    <Filter2 bind:filter bind:filters availableFilters={[
        { name: "company.name", default: true },
        { name: "state" },
        { name: "origin" }
    ]} />

    <Table embeded>
        <svelte:fragment slot="head">
            <TableHead>Société</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Intérets</TableHead>
            <TableHead>Origine</TableHead>
            <TableHead>Commentaire</TableHead>
        </svelte:fragment>

        <svelte:fragment slot="body">

            {#each data.leads.items as lead}
                <TableRow>
                    <TableCell>
                        <h5>{lead.expand?.company.name}</h5>
                        <span class="text-sm text-zinc-500 block">{[lead.expand?.company.field, lead.expand?.company.sector, lead.expand?.company.type].filter(l => l != "").join(" / ")}</span>
                        <span class="text-sm text-zinc-500 block">Pays: {lead.expand?.company.country}</span>                    
                    </TableCell>
                    <TableCell>{lead.state || "—"}</TableCell>
                    <TableCell>
                        <Flex gap={2} items="center" wrap="wrap">
                            {#each lead.expand?.company_contacts ?? [] as contact}
                                <CompanyContact {contact} />
                            {/each}
                        </Flex>
                    </TableCell>
                    <TableCell>
                        <Flex gap={2} items="center" wrap="wrap">
                            {#each lead.expand?.["crm_leads_interests(lead)"] ?? [] as interest}
                                <InterestLabel interest={interest.expand?.interest} />
                            {/each}
                        </Flex>
                    </TableCell>
                    <TableCell>{lead.origin}</TableCell>
                    <TableCell>{lead.comment}</TableCell>
                </TableRow>
            {/each}
        </svelte:fragment>
    </Table>

    <TablePages totalPages={data.leads.totalPages} bind:currentPage={itemsPage} />
</Wrapper>
