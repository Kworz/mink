<script lang="ts">
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import { PlusCircle, Wrench } from "@steeze-ui/heroicons";
    import type { ActionData, PageData } from "./$types";
    import { invalidateAll } from "$app/navigation";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import MenuSide from "$lib/components/appLayout/MenuSide.svelte";
    import { enhance } from "$app/forms";
    import FormInput from "$lib/components/FormInput.svelte";
    import Button from "$lib/components/Button.svelte";
    import type { CrmInterestResponse } from "$lib/DBTypes";
    import { Icon } from "@steeze-ui/svelte-icon";
    import InterestLabel from "./InterestLabel.svelte";

    let createInterest = false;
    let editInterest: CrmInterestResponse | undefined = undefined;
    let deleteInterestConfirm: string | undefined = undefined;

    export let data: PageData;
    export let form: ActionData;

    $: if(form != null) { createInterest = false; editInterest = undefined; invalidateAll(); };

    const colorList = [
        "bg-slate-500",
        "bg-gray-500",
        "bg-zinc-500",
        "bg-neutral-500",
        "bg-stone-500",
        "bg-red-500",
        "bg-orange-500",
        "bg-amber-500",
        "bg-yellow-500",
        "bg-lime-500",
        "bg-green-500",
        "bg-emerald-500",
        "bg-teal-500",
        "bg-cyan-500",
        "bg-sky-500",
        "bg-blue-500",
        "bg-indigo-500",
        "bg-violet-500",
        "bg-purple-500",
        "bg-fuchsia-500",
        "bg-pink-500",
        "bg-rose-500",
        "background-rainbow"
    ];

</script>

{#if createInterest || editInterest !== undefined}
    <MenuSide closable on:close={() => { createInterest = false; editInterest = undefined;}}>
        <h3 class="mb-4">Créer un intéret</h3>

        <form action={editInterest !== undefined ? "?/editInterest" : "?/createInterest"} method="post" use:enhance class="flex flex-col gap-4">

            {#if editInterest !== undefined}
                <input type="hidden" name="id" value={editInterest.id} />
            {/if}
        
            <FormInput label="Nom" labelMandatory name="name" value={editInterest?.name} />
            <FormInput label="Description" name="description" value={editInterest?.description}/>
            <FormInput label="Couleur" name="color" type="select" value={editInterest?.color ?? "bg-red-500"}>
                {#each colorList as color}
                    <option value={color} class="capitalize">{color.split("-").at(1)}</option>
                {/each}
            </FormInput>

            <Button role={editInterest !== undefined ? "warning" : "success"}>{editInterest !== undefined ? "Modifier" : "Créer"}</Button>
        </form>
    </MenuSide>
{/if}

<Wrapper>

    <h3>Intérets</h3>
    <p>Liste des intérets que peuvent porter les prospects.</p>

    <PillMenu>
        <PillMenuButton icon={PlusCircle} click={() => createInterest = !createInterest}>Créer un intéret</PillMenuButton>
    </PillMenu>

</Wrapper>

<Table>
    <svelte:fragment slot="head">
        <TableHead>Intéret ({data.interests.length})</TableHead>
        <TableHead>Description</TableHead>
        <TableHead><Icon src={Wrench} class="h-4 w-4 text-zinc-500"/></TableHead>
    </svelte:fragment>

    <svelte:fragment slot="body">

        {#each data.interests as interest}
            <TableRow>
                <TableCell><InterestLabel {interest} /></TableCell>
                <TableCell>{interest.description}</TableCell>
                <TableCell>
                    <Button size="small" role="warning" on:click={() => editInterest = interest} class="mr-2">Modifier</Button>

                    {#if deleteInterestConfirm == interest.id}
                        <form action="?/deleteInterest" method="post" use:enhance class="inline">
                            <input type="hidden" name="id" value={interest.id} />
                            <Button size="small" role="danger">Confirmer</Button>
                        </form>
                    {:else}
                        <Button size="small" on:click={() => deleteInterestConfirm = interest.id } role="danger">Supprimer</Button>
                    {/if}
                    
                </TableCell>
            </TableRow>
        {/each}
    </svelte:fragment>
</Table>