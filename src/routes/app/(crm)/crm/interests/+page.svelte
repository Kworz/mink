<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/generics/Button.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import MenuSide from "$lib/components/generics/menu/MenuSide.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import type { crm_interest } from "@prisma/client";
    import { PlusCircle } from "@steeze-ui/heroicons";
    import type { ActionData, PageData } from "./$types";
    import InterestLabel from "./InterestLabel.svelte";
    import EmptyData from "$lib/components/EmptyData.svelte";

    let createInterest = false;
    let editInterest: crm_interest | undefined = undefined;
    let deleteInterestConfirm: string | undefined = undefined;

    export let data: PageData;
    export let form: ActionData;

    $: if(form?.upsertInterest && "success" in form.upsertInterest) { createInterest = false; editInterest = undefined; invalidateAll(); };
    $: if(form?.upsertInterest && "error" in form.upsertInterest) { setTimeout(() => form = null, 3000); };
    $: if(form?.deleteInterest && "success" in form.deleteInterest) { deleteInterestConfirm = undefined; invalidateAll(); };

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
    <MenuSide on:close={() => { createInterest = false; editInterest = undefined;}} title="{createInterest ? "Créer" : "Modifier"} un intéret">

        {#if form?.upsertInterest && "error" in form?.upsertInterest}<p class="text-red-500 mb-2">{form?.upsertInterest?.error}</p>{/if}

        <form action="?/upsertInterest" method="post" use:enhance class="flex flex-col gap-4">

            {#if editInterest !== undefined}<input type="hidden" name="id" value={editInterest.id} />{/if}
        
            <FormInput label="Nom" required name="name" value={editInterest?.name} />
            <FormInput label="Description" name="description" value={editInterest?.description}/>
            <FormInput label="Couleur" required name="color" type="select" value={editInterest?.color ?? "bg-red-500"}>
                {#each colorList as color}
                    <option value={color} class="capitalize">{color.split("-").at(1)}</option>
                {/each}
            </FormInput>

            <Button role={editInterest !== undefined ? "warning" : "success"}>{editInterest !== undefined ? "Modifier" : "Créer"}</Button>
        </form>
    </MenuSide>
{/if}

<PillMenu>
    <PillMenuButton icon={PlusCircle} click={() => createInterest = !createInterest}>Créer un intéret</PillMenuButton>
</PillMenu>

<h1>CRM: Intérets</h1>
<p class="mb-6">Liste des intérets que peuvent porter les prospects.</p>

{#if data.interests.length > 0}
    <Table headers={[{ label: "Intéret" }, { label: "Description" }, { label: "Actions" }]}>
        {#each data.interests as interest}
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
        {/each}
    </Table>
{:else}
    <EmptyData on:click={() => createInterest = true } />
{/if}