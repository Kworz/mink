<script lang="ts">
    import { browser } from "$app/environment";
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import type { FilterCondition } from "$lib/components/derived/filter/filter2";
    import Button from "$lib/components/generics/Button.svelte";
    import DetailLabel from "$lib/components/generics/DetailLabel.svelte";
    import Wrapper from "$lib/components/generics/containers/Wrapper.svelte";
    import Wrapper2 from "$lib/components/generics/containers/Wrapper2.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import MenuSide from "$lib/components/generics/menu/MenuSide.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import { crm_company_size, type crm_company, type crm_company_contact } from "@prisma/client";
    import { BuildingOffice, ChevronDown, ChevronUp, Wrench } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import type { ActionData, PageData, Snapshot } from "./$types";

    export let data: PageData;
    export let form: ActionData;

    let expandedCompany: string | undefined = undefined;

    let newCompany = false;
    let editCompany: crm_company | undefined = undefined;

    let newContact = false;
    let editContact: crm_company_contact | undefined = undefined;

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
    <MenuSide on:close={() => { editCompany = undefined; newCompany = false;}} title="{editCompany ? "Modifier" : "Créer"} une société">
        <form action={"?/upsertCompany"} method="post" use:enhance class="flex flex-col gap-4">
            
            {#if editCompany}<input type="hidden" name="id" value={editCompany.id} />{/if}

            <FormInput label="Nom" required name="name" value={editCompany?.name} />
            <FormInput label="Secteur" name="sector" value={editCompany?.sector} />
            <FormInput label="Type" name="type" value={editCompany?.type} />
            <FormInput type="select" label="Pays" name="country" value={editCompany?.country}>
                {#await import("$lib/components/utils/countries") then countries}
                    {#each Object.keys(countries.countries) as country}
                        <option value={country}>{countries.countries[country]}</option>
                    {/each}
                {/await}
            </FormInput>
            <FormInput type="select" label="Taille" name="size" value={editCompany?.size ?? "small"}>
                {#each Object.keys(crm_company_size) as size}
                    <option value={size}>{size}</option>
                {/each}
            </FormInput>    

            <Button role={editCompany ? "warning" : "primary"}>{editCompany ? "Modifier" : "Créer"}</Button>
        </form>
    </MenuSide>
{/if}

{#if editContact || newContact}
    <MenuSide on:close={() => { editContact = undefined; newContact = false }} title="{editContact ? "Modifier" : "Créer"} un contact">
        <form action={"?/upsertContact"} method="post" use:enhance class="flex flex-col gap-4">
            
            {#if editContact}<input type="hidden" name="id" value={editContact.id} />{/if}

            <FormInput label="Nom" required name="name" value={editContact?.name} />
            <FormInput label="Position" name="position" value={editContact?.position} />
            <FormInput label="Email" type="email" name="email" value={editContact?.email} />
            <FormInput label="Telephone" name="phone" value={editContact?.phone} />

            <Button role={editContact ? "warning" : "primary"}>{editContact ? "Modifier" : "Créer"}</Button>
        </form>
    </MenuSide> 
{/if}

<h1>CRM: Sociétés et contacts</h1>
<p>Liste des sociétés avec lesquelles il y as deja eu conversation</p>
<p>Nombre de sociétés: <DetailLabel>{data.companies?.length}</DetailLabel>.</p>

<PillMenu>
    <PillMenuButton icon={BuildingOffice} click={() => newCompany = true}>Nouvelle société</PillMenuButton>
</PillMenu>

<div class="grid gap-6 grid-cols-1 lg:grid-cols-2 mt-6">
    {#each data.companies as company}
        <Wrapper class="self-start">
            <Flex justify="between" items="center">
                <h3 class="mb-2">{company.name}</h3>
                <button on:click={() => editCompany = company}>
                    <Icon src={Wrench} class="h-4 w-4 text-orange-500 hover:text-orange-700" />
                </button>
            </Flex>
            <p class="text-sm text-zinc-500">{[company.sector, company.type].filter(l => l != '').join(" / ")}</p>
            <p>Pays: {company.country}.</p>
            <p>Taille: {company.size} personnes.</p>

            {#if company.contacts !== undefined}
                <Flex direction="row" gap={4} items="center" class="mt-4 mb-1 w-full">
                    <h4>Contacts ({company.contacts.length})</h4>
                    <div class="h-[1px] bg-zinc-500/25 grow"/>
                    <button on:click={() => expandedCompany = expandedCompany === company.id ? undefined : company.id}>
                        <Icon src={expandedCompany === company.id ? ChevronUp : ChevronDown} class="h-6 w-6 text-zinc-500"/>
                    </button>
                </Flex>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 {expandedCompany === company.id ? "mt-2" : ""}">
                    {#each expandedCompany === company.id ? company.contacts : [] as contact (contact.id)}
                        <Wrapper2 padding="p-4">
                            <button class="absolute top-6 right-6" on:click={() => editContact = contact}>
                                <Icon src={Wrench} class="h-4 w-4 text-orange-500 hover:text-orange-700" />
                            </button>

                            <Flex items="center" class="mb-0.5">
                                <h5>{contact.name}</h5>
                                <span class="text-sm text-zinc-500">{contact.position}</span>
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