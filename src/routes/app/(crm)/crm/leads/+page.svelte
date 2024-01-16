<script lang="ts">
    import { browser } from "$app/environment";
    import { goto, invalidateAll } from "$app/navigation";
    import { page } from "$app/stores";
    import EmptyData from "$lib/components/EmptyData.svelte";
    import Filter2 from "$lib/components/derived/filter/Filter.svelte";
    import type { FilterCondition } from "$lib/components/derived/filter/filter";
    import DetailLabel from "$lib/components/generics/DetailLabel.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import TablePages from "$lib/components/generics/table/TablePages.svelte";
    import { PlusCircle } from "@steeze-ui/heroicons";
    import CompanyContact from "../companies/CompanyContact.svelte";
    import InterestLabel from "../interests/InterestLabel.svelte";
    import type { ActionData, PageData, Snapshot } from "./$types";

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

<h1>Leads</h1>
<p>Listes des pistes commerciales</p>
<p>Nombre de pistes: <DetailLabel>{data.leads.length}</DetailLabel>.</p>

<PillMenu>
    <PillMenuButton icon={PlusCircle} click={() => createLead = !createLead}>Créer une piste</PillMenuButton>
</PillMenu>

{#if data.leads.length > 0}
    <Filter2 bind:filter bind:filters availableFilters={[
        { name: "company.name", default: true },
        { name: "state" },
        { name: "origin" }
    ]} />

    <Table embeded headers={[{ label: "Société" }, { label: "Statut" }, { label: "Contact" }, { label: "Intérets" }, { label: "Origines" }, { label: "Commentaire" }]}>
        {#each data.leads as lead}
            <TableCell>
                <h5>{lead.company.name}</h5>
                <span class="text-sm text-zinc-500 block">{[lead.company.sector, lead.company.type].filter(l => l != "").join(" / ")}</span>
                <span class="text-sm text-zinc-500 block">Pays: {lead.company.country}</span>                    
            </TableCell>
            <TableCell>{lead.state || "—"}</TableCell>
            <TableCell>
                <Flex gap={2} items="center" wrap="wrap">
                    {#each lead.contacts as contact}
                        <CompanyContact contact={contact.contact} />
                    {/each}
                </Flex>
            </TableCell>
            <TableCell>
                <Flex gap={2} items="center" wrap="wrap">
                    {#each lead.interests as interest}
                        <InterestLabel interest={interest.interest} />
                    {/each}
                </Flex>
            </TableCell>
            <TableCell>{lead.origin}</TableCell>
            <TableCell>{lead.comment}</TableCell>
        {/each}
    </Table>

    <TablePages totalPages={data.leads.totalPages} bind:currentPage={itemsPage} />
{:else}
    <EmptyData on:click={() => createLead = true} />
{/if}