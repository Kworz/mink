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
    import { Home } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import type { ActionData, PageData } from "./$types";
    import MenuSide from "$lib/components/appLayout/MenuSide.svelte";

    import type { SCMSupplier } from "@prisma/client";

    export let data: PageData;
    export let form: ActionData;

    let editSupplier: SCMSupplier | undefined = undefined;
    let deleteConfirm: string | undefined = undefined;
    let createSupplier = false;

    $: if(form !== undefined && browser) { editSupplier = undefined; createSupplier = false; invalidateAll(); };
    $: if(deleteConfirm !== undefined) { setTimeout(() => deleteConfirm = undefined, 5000); }

</script>

<svelte:head>
    <title>Nomenclaturize — Fournisseurs</title>
</svelte:head>

{#if editSupplier !== undefined || createSupplier}

    <MenuSide closable on:close={() => { editSupplier = undefined; createSupplier = false; }}>

        <form action={createSupplier ? "?/createSupplier" : "?/editSupplier"} method="post" use:enhance>

            {#if !createSupplier}
                <input type="hidden" name="id" value={editSupplier?.id ?? ""} />
            {/if}

            <Flex direction="col">

                {#if (editSupplier?.logo ?? "") !== "" && browser}
                    <Flex items="center" gap={2}>
                        <img src={editSupplier?.logo} class="h-8 inline-block mr-4 rounded-md" alt="logo" />
                        <Button size="small" role="danger" on:click={() => { editSupplier.logo = "" }}>Supprimer l'image</Button>
                    </Flex>
                {:else}
                    <FormInput type="file" name="logo" label="Logo fournisseur" backgroundColor="bg-white" />
                {/if}

                <FormInput name="name" label="Nom du fournisseur" labelMandatory={true} value={editSupplier?.name ?? ""}  backgroundColor="bg-white"/>
                <Flex items="center" gap={2}>
                    <input type="checkbox" name="internal" checked={editSupplier?.internal ?? false}>
                    <span>Fournisseur interne</span>
                </Flex>
                <FormInput name="website" label="Site web" value={editSupplier?.website ?? ""} />
                <FormInput name="address" label="Adresse" value={editSupplier?.address ?? ""} />
                <FormInput type="email" name="email" label="Email de contact" value={editSupplier?.email ?? ""}/>

                <FormInput type="select" name="payment_rule" value={editSupplier?.payment_rule ?? ""} label="Conditions de paiement" >
                    <option value={undefined}>—</option>
                    <option value="order">À la commande</option>
                    <option value="received">À la reception</option>
                    <option value="30eom">30 Jours fin du mois</option>
                    <option value="45eom">45 Jours fin du mois</option>
                    <option value="60d">60 Jours</option>
                </FormInput>

            </Flex>

            <Flex class="mt-6">
                <Button role="success">Valider les modifications</Button>
                <Button on:click={() => (createSupplier) ? createSupplier = false : editSupplier = undefined} role="warning">Annuler les modifications</Button>
            </Flex>
        
        </form>
    </MenuSide>
    
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
                            <a href={supplier.website ?? "#"}>
                                {#if supplier.logo !== null}
                                    <img src={supplier.logo} alt="Logo {supplier.name}" class="h-8 inline-block mr-4 rounded-md" />
                                {/if}
                                <span>
                                    {supplier.name}
                                </span>
                            </a>
                        </Flex>
                    </TableCell>
                    <TableCell>{supplier.address}</TableCell>
                    <TableCell><a href="mailto:{supplier.email}">{supplier.email}</a></TableCell>
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
