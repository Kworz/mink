<script lang="ts">
    import Wrapper from "$lib/components/Wrapper.svelte";
    import Wrapper2 from "$lib/components/Wrapper2.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import { justifies } from "$lib/components/layout/flexTypes";
    import { Icon } from "@steeze-ui/svelte-icon";
    import type { ActionData, PageData, Snapshot } from "./$types";
    import { BuildingOffice, ChevronDown, ChevronUp, Wrench } from "@steeze-ui/heroicons";
    import type { CrmCompanyResponseExpanded } from "./+page.server";
    import { CrmCompanySizeOptions, type CrmCompanyContactResponse } from "$lib/DBTypes";
    import { enhance } from "$app/forms";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import MenuSide from "$lib/components/appLayout/MenuSide.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Button from "$lib/components/Button.svelte";
    import Filter2 from "$lib/components/filter/Filter2.svelte";
    import { browser } from "$app/environment";
    import { page } from "$app/stores";
    import type { FilterCondition } from "$lib/components/filter/filter2";
    import { goto } from "$app/navigation";
    import TablePages from "$lib/components/table/TablePages.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";

    export let data: PageData;
    export let form: ActionData;

    let expandedCompany: string | undefined = undefined;

    let newCompany = false;
    let editCompany: CrmCompanyResponseExpanded | undefined = undefined;

    let newContact = false;
    let editContact: CrmCompanyContactResponse | undefined = undefined;

    const sizeOptions = Object.entries(CrmCompanySizeOptions).map(([key, value]) => ({ key, value }));

    let filters: Array<FilterCondition> = [];
    let filter: string = $page.url.searchParams.get("filter") ?? "";

    let activeSort = $page.url.searchParams.get("sort") ?? "name";
    let itemsPage = Number($page.url.searchParams.get("page")) ?? 1;

    export const snapshot: Snapshot<Array<FilterCondition>> = {
        capture: () => filters,
        restore: (value) => filters = value
    }

    const triggerRefresh = () => {
        if(browser) {
            goto(`/app/crm/companies?sort=${activeSort}&page=${itemsPage}&filter=${filter}`, { noScroll: true });
        }
    }

    $: filter, activeSort, itemsPage, triggerRefresh();

    $: if(form !== null) { editCompany = undefined; editContact = undefined; newCompany = false; newContact = false; }

</script>

{#if editCompany || newCompany}
    <MenuSide closable on:close={() => { editCompany = undefined; newCompany = false;}}>
        <form action={editCompany ? "?/editCompany" : "?/newCompany"} method="post" use:enhance class="flex flex-col gap-4">
            
            <h3>{editCompany ? "Modifier" : "Créer"} une société</h3>

            {#if editCompany}
                <input type="hidden" name="id" value={editCompany.id} />
            {/if}

            <FormInput label="Nom" labelMandatory name="name" value={editCompany?.name} />
            <FormInput label="Secteur" name="sector" value={editCompany?.sector} />
            <FormInput label="Domaine" name="field" value={editCompany?.field} />
            <FormInput label="Type" name="type" value={editCompany?.type} />
            <FormInput type="select" label="Pays" name="country" value={editCompany?.country}>
                {#await import("$lib/components/utils/countries") then countries}
                    {#each Object.keys(countries.countries) as country}
                        <option value={country}>{countries.countries[country]}</option>
                    {/each}
                {/await}
            </FormInput>
            <FormInput type="select" label="Taille" name="size" value={editCompany?.size ?? "0-5"}>
                {#each sizeOptions as size}
                    <option value={size.value}>{size.key}</option>
                {/each}
            </FormInput>    

            <Button role={editCompany ? "warning" : "primary"}>{editCompany ? "Modifier" : "Créer"}</Button>
        </form>
    </MenuSide>
{/if}

{#if editContact || newContact}
    <MenuSide closable on:close={() => { editContact = undefined; newContact = false }}>
        
        <form action={editContact ? "?/editContact" : "?/newContact"} method="post" use:enhance class="flex flex-col gap-4">
            
            <h3>{editContact ? "Modifier" : "Créer"} un contact</h3>

            {#if editContact}
                <input type="hidden" name="id" value={editContact.id} />
            {/if}

            <FormInput label="Nom" labelMandatory name="name" value={editContact?.name} />
            <FormInput label="Role" name="company_role" value={editContact?.company_role} />
            <FormInput label="Email" type="email" name="email" value={editContact?.email} />
            <FormInput label="Telephone" name="phone" value={editContact?.phone} />

            <Button role={editContact ? "warning" : "primary"}>{editContact ? "Modifier" : "Créer"}</Button>
        </form>
    </MenuSide> 
{/if}

<Wrapper>
    <h2>Sociétés et contacts</h2>
    <p>Liste des sociétés avec lesquelles il y as deja eu conversation</p>
    <p>Nombre de sociétés: <DetailLabel>{data.companies?.totalItems}</DetailLabel>.</p>

    <PillMenu>
        <PillMenuButton icon={BuildingOffice} click={() => newCompany = true}>Nouvelle société</PillMenuButton>
    </PillMenu>
</Wrapper>

<Wrapper class="mt-6">
    <Filter2 bind:filter bind:filters availableFilters={[
        { name: "name", default: true },
        { name: "state" },
        { name: "origin" }
    ]} />
    <TablePages totalPages={data.companies?.totalPages} bind:currentPage={itemsPage} />
</Wrapper>

<div class="grid gap-6 grid-cols-1 lg:grid-cols-2 mt-6">
    {#each data.companies?.items ?? [] as company}
        <Wrapper class="self-start">
            <Flex justify="between" items="center">
                <h3 class="mb-2">{company.name}</h3>
                <button on:click={() => editCompany = company}>
                    <Icon src={Wrench} class="h-4 w-4 text-orange-500 hover:text-orange-700" />
                </button>
            </Flex>
            <p class="text-sm text-zinc-500">{[company.sector, company.field, company.type].filter(l => l != '').join(" / ")}</p>
            <p>Pays: {company.country}.</p>
            <p>Taille: {company.size} personnes.</p>

            {#if company.expand?.["crm_company_contact(company)"] !== undefined}
                <Flex direction="row" gap={4} items="center" class="mt-4 mb-1 w-full">
                    <h4>Contacts ({company.expand["crm_company_contact(company)"].length})</h4>
                    <div class="h-[1px] bg-zinc-500/25 grow"/>
                    <button on:click={() => expandedCompany = expandedCompany === company.id ? undefined : company.id}>
                        <Icon src={expandedCompany === company.id ? ChevronUp : ChevronDown} class="h-6 w-6 text-zinc-500"/>
                    </button>
                </Flex>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 {expandedCompany === company.id ? "mt-2" : ""}">
                    {#each expandedCompany === company.id ? company.expand["crm_company_contact(company)"] : [] as contact (contact.id)}
                        <Wrapper2 padding="p-4">
                            <button class="absolute top-6 right-6" on:click={() => editContact = contact}>
                                <Icon src={Wrench} class="h-4 w-4 text-orange-500 hover:text-orange-700" />
                            </button>

                            <Flex items="center" class="mb-0.5">
                                <h5>{contact.name}</h5>
                                <span class="text-sm text-zinc-500">{contact.company_role}</span>
                            </Flex>
                            <p>email: <a href="mailto:{contact.email}">{contact.email}</a></p>
                            <p>telephone: <a href="tel:{contact.phone}">{contact.phone}</a></p>
                        </Wrapper2>
                    {/each}
                </div>
            {/if}
        </Wrapper>
    {/each}
</div>