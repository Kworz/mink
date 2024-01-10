<script lang="ts">
    import { browser } from "$app/environment";
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import EmptyData from "$lib/components/EmptyData.svelte";
    import Button from "$lib/components/generics/Button.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import MenuSide from "$lib/components/generics/menu/MenuSide.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import { payment_method, payment_rule, type scm_supplier } from "@prisma/client";
    import { Home, PlusCircle } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import type { ActionData, PageData } from "./$types";

    export let data: PageData;
    export let form: ActionData;

    let editSupplier: scm_supplier | undefined = undefined;

    let upsertSent = false;

    let deleteConfirm: string | undefined = undefined;
    let createSupplier = false;

    $: if(form !== null) { editSupplier = undefined; createSupplier = false; upsertSent = false; invalidateAll(); };
    $: if(deleteConfirm !== undefined) { setTimeout(() => deleteConfirm = undefined, 5000); }

</script>

<svelte:head>
    <title>mink — Fournisseurs</title>
</svelte:head>

{#if editSupplier !== undefined || createSupplier}
    <MenuSide closable on:close={() => { editSupplier = undefined; createSupplier = false; }} title="Créer un founisseur">
        <form action="?/upsertSupplier" use:enhance method="post" enctype="multipart/form-data" on:submit={() => upsertSent = true}>

            {#if !createSupplier}<input type="hidden" name="id" value={editSupplier?.id ?? ""} />{/if}

            <Flex direction="col">

                {#if (editSupplier?.logo ?? "") !== "" && browser}
                    <Flex items="center" gap={2}>
                        <img src={editSupplier?.logo} class="h-8 inline-block mr-4 rounded-md" alt="logo" />
                        <Button size="small" role="danger" on:click={() => { if(editSupplier) { editSupplier.logo = "" }}}>Supprimer l'image</Button>
                    </Flex>
                {:else}
                    <FormInput type="file" name="logo" label="Logo fournisseur" backgroundColor="bg-white" />
                {/if}

                <FormInput name="name" label="Nom du fournisseur" labelMandatory={true} value={editSupplier?.name ?? ""}  backgroundColor="bg-white" autocomplete="organization"/>
                
                <Flex items="center" gap={2}>
                    <input type="checkbox" name="internal" checked={editSupplier?.internal ?? false}>
                    <span>Fournisseur interne</span>
                </Flex>

                <FormInput name="website" label="Site web" value={editSupplier?.website ?? ""} autocomplete="website" />

                <FormInput name="address_road" label="Rue" value={editSupplier?.address_road ?? ""} autocomplete="address-line1" />
                <FormInput name="address_postal_code" label="Code postal" value={editSupplier?.address_postal_code ?? ""} autocomplete="postal-code" />
                <FormInput name="address_city" label="Ville" value={editSupplier?.address_city ?? ""} autocomplete="address-level2" />
                <FormInput name="address_country" label="Pays" value={editSupplier?.address_country ?? ""} autocomplete="country" />

                <FormInput type="email" name="email" label="Email de contact" value={editSupplier?.email ?? ""} autocomplete="email" />

                <FormInput type="select" name="payment_rule" value={editSupplier?.payment_rule ?? ""} label="Conditions de paiement">
                    <option value={undefined}>—</option>
                    {#each Object.keys(payment_rule) as paymentRule}
                        <option value={paymentRule}>{paymentRule}</option>
                    {/each}
                </FormInput>

                <FormInput type="select" name="payment_method" value={editSupplier?.payment_method ?? ""} label="Méthode de paiement" multiple>
                    <option value={"test"}>—</option>
                    {#each Object.keys(payment_method) as paymentMethod}
                        <option value={paymentMethod}>{paymentMethod}</option>
                    {/each}
                </FormInput>
            </Flex>

            <Button role="success" class="mt-6" suspense={upsertSent}>Valider les modifications</Button>
        </form>
    </MenuSide>
{/if}

<h1>Liste des fournisseurs</h1>
<p>Liste des fournisseurs disponibles.</p>

<PillMenu>
    <PillMenuButton icon={PlusCircle} click={() => createSupplier = true}>Créer un fournisseur</PillMenuButton>
</PillMenu>

{#if data.suppliers.length > 0}
    <Table class="mt-6" headers={[{ label: "Nom du fournisseur"}, { label: "Adresse"}, { label: "Adresse mail"}, { label: "Actions" }]}>  
        {#each data.suppliers as supplier}
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
            <TableCell>
                <p>{supplier.address_road}</p>
                <p>{supplier.address_city}, {supplier.address_postal_code}</p>
                <p class="uppercase">{supplier.address_country}</p>
            </TableCell>
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
        {/each}
    </Table>
{:else}
    <EmptyData on:click={() => createSupplier = true} />
{/if}