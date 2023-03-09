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
    import { Home } from "@steeze-ui/heroicons";
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


{#if editSupplier !== undefined || createSupplier}
    <Wrapper class="mb-6">
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
                <Button size="small" role="success">Valider les modifications</Button>
                <Button on:click={() => { 
                    console.log("prevent");
                    if(createSupplier)
                    {
                        createSupplier = false;
                    }else{
                        editSupplier = undefined;
                    }
                    }}  size="small" role="warning">Annuler les modifications</Button>
            </Flex>
        
        </form>
    </Wrapper>
{/if}

<Wrapper>

    <Flex items="center" justify="between">
        <h2>Liste des fournisseurs</h2>
        <Button size="small" on:click={() => createSupplier = true}>Créer un fournisseur</Button>
    </Flex>

    <Table embeded={true}>
    
        <svelte:fragment slot="head">
            <TableHead>Nom du fournisseur</TableHead>
            <TableHead colWidth="w-1/3">Addresse</TableHead>
            <TableHead>Addresse de contact</TableHead>
            <TableHead>Actions</TableHead>
        </svelte:fragment>
    
        <svelte:fragment slot="body">
            {#each data.suppliers as supplier}
                <TableRow>
                    <TableCell>
                        <Flex items="center">
                            {#if supplier.internal}
                                <Icon src={Home} class="h-4 w-4" />
                            {/if}
                            <a href={supplier.website ?? "#"}>{supplier.name}</a>
                        </Flex>
                    </TableCell>
                    <TableCell>{supplier.address}</TableCell>
                    <TableCell><a href="mailto:{supplier.contact_email}">{supplier.contact_email}</a></TableCell>
                    <TableCell>
                        <Flex>
                            {#if deleteConfirm === supplier.id}
                                <form action="?/deleteSupplier" method="post" use:enhance>
                                    <input type="hidden" name="id" value={supplier.id} />
                                    <Button size="small" role="danger">Confirmer</Button>
                                </form>
                            {:else}
                                <Button size="small" role="danger" on:click={() => deleteConfirm = supplier.id}>Supprimer</Button>
                            {/if}
                            <Button size="small" role="warning" on:click={() => editSupplier = supplier}>Modifier</Button>
                        </Flex>
                    </TableCell>
                </TableRow>
            {/each}
        </svelte:fragment>
    </Table>
</Wrapper>
