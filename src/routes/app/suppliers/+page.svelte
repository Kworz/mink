<script lang="ts">
    import { browser } from "$app/environment";
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import type { SuppliersResponse } from "$lib/DBTypes";
    import { Check, XMark } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import type { ActionData, PageData } from "./$types";

    export let data: PageData;
    export let form: ActionData;

    let editSupplier: SuppliersResponse | undefined;
    let createSupplier = false;
    let deleteConfirm: string | undefined = undefined;

    $: if(form !== undefined && browser) { editSupplier = undefined; createSupplier = false; invalidateAll(); };
    $: if(deleteConfirm !== undefined) { setTimeout(() => deleteConfirm = undefined, 5000); }
    

</script>
<h2>Liste des fournisseurs</h2>

<Flex class="mt-6">
    <Button on:click={() => createSupplier = true}>Créer un fournisseur</Button>
</Flex>

{#if editSupplier !== undefined || createSupplier}
    <Wrapper class="mt-6">
        <form action={createSupplier ? "?/createSupplier" : "?/editSupplier"} method="post" use:enhance>

            {#if !createSupplier}
                <input type="hidden" name="id" value={editSupplier?.id ?? ""} />
            {/if}

            <Flex direction="col">
                <FormInput name="name" label="Nom du fournisseur" labelMandatory={true} value={editSupplier?.name ?? ""}  backgroundColor="bg-white"/>
                <Flex items="center" gap={2}>
                    <input type="checkbox" name="internal" checked={editSupplier?.internal ?? false}>
                    <span>Fournisseur interne</span>
                </Flex>
                <FormInput name="website" label="Site web" value={editSupplier?.website ?? ""} backgroundColor="bg-white"/>
                <FormInput name="address" label="Adresse" value={editSupplier?.address ?? ""} backgroundColor="bg-white"/>
                <FormInput type="email" name="contact_email" label="Email de contact" value={editSupplier?.contact_email ?? ""} backgroundColor="bg-white"/>
            </Flex>

            <Flex class="mt-6">
                <Button size="small" borderColor="border-emerald-500" hoverColor="hover:bg-emerald-500">Valider les modifications</Button>
                <Button on:click={() => { 
                    console.log("prevent");
                    if(createSupplier)
                    {
                        createSupplier = false;
                    }else{
                        editSupplier = undefined;
                    }
                    }}  size="small" borderColor="border-amber-500" hoverColor="hover:bg-amber-500">Annuler les modifications</Button>
            </Flex>
        
        </form>
    </Wrapper>
{/if}

<Table>

    <svelte:fragment slot="head">
        <TableHead>Nom du fournisseur</TableHead>
        <TableHead>Fournisseur interne</TableHead>
        <TableHead>Site web</TableHead>
        <TableHead>Addresse</TableHead>
        <TableHead>Addresse de contact</TableHead>
        <TableHead>Actions</TableHead>
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#each data.suppliers as supplier}
            <TableRow>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>
                    <Icon src={supplier.internal ? Check : XMark} class="h-6 w-6 mx-auto {supplier.internal ? "text-emerald-500" : "text-red-500"}" />
                </TableCell>
                <TableCell>{#if supplier.website != ""}<a href={supplier.website}>Voir le site</a>{/if}</TableCell>
                <TableCell>{supplier.address}</TableCell>
                <TableCell>{supplier.contact_email}</TableCell>
                <TableCell>
                    <Flex>
                        {#if deleteConfirm === supplier.id}
                            <form action="?/deleteSupplier" method="post" use:enhance>
                                <input type="hidden" name="id" value={supplier.id} />
                                <Button size="small" borderColor="border-red-500" hoverColor="hover:bg-red-500">Confirmer</Button>
                            </form>
                        {:else}
                            <Button size="small" borderColor="border-red-500" hoverColor="hover:bg-red-500" on:click={() => deleteConfirm = supplier.id}>Supprimer le fournisseur</Button>
                        {/if}
                        <Button size="small" borderColor="border-amber-500" hoverColor="hover:bg-amber-500" on:click={() => editSupplier = supplier}>Modifier le fournisseur</Button>
                    </Flex>
                </TableCell>
            </TableRow>
        {/each}
    </svelte:fragment>
</Table>