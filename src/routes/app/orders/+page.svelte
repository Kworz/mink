<script lang="ts">
    import { enhance } from "$app/forms";


    import Button from "$lib/components/Button.svelte";
import FormInput from "$lib/components/FormInput.svelte";
import Flex from "$lib/components/layout/flex.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { OrdersStateOptions } from "$lib/DBTypes";
    import { PlusCircle } from "@steeze-ui/heroicons";
    import type { PageData } from "./$types";
    import OrderTable from "./OrderTable.svelte";
    export let data: PageData;

    let pillMenuOpen = false;

    let showCompletedOrders = false;
    let createOrder = false;

    $: orders = (showCompletedOrders) ? data.orders : data.orders.filter(k => k.state !== OrdersStateOptions.completed);

</script>

<Wrapper>
    <h2>Commandes</h2>

    <PillMenu bind:open={pillMenuOpen}>
        <PillMenuButton icon={PlusCircle} on:click={() => { createOrder = !createOrder; pillMenuOpen = false;}}>Créer une commande</PillMenuButton>
    </PillMenu>
    
    <Flex items="center" gap={2}>
        <input type="checkbox" bind:checked={showCompletedOrders}/>
        <span>Afficher les commandes terminées</span>
    </Flex>
</Wrapper>

{#if createOrder}
    <Wrapper class="mt-6">
        <form action="?/createOrder" method="post" use:enhance class="flex gap-6 items-end">
            <FormInput name="name" label="Numéro de commande" labelMandatory={true} />
            <FormInput type="select" name="supplier" label="Fournisseur" labelMandatory={true}>
                {#each data.suppliers as supplier}
                    <option value={supplier.id}>{supplier.name}</option>
                {/each}
            </FormInput>
            <Button>Créer la commande</Button>
        </form>
    </Wrapper>
{/if}

<OrderTable bind:orders />
    
