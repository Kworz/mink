<script lang="ts">
    import { browser } from "$app/environment";
    import { page } from "$app/stores";
    import { Collections, type StoresResponse, type SuppliersResponse } from "$lib/DBTypes";
    import { onMount } from "svelte";
    import type { ArticleResponseExpanded } from "../../../routes/app/articles/+page.server";
    import FormInput from "../FormInput.svelte";
    import Flex from "../layout/flex.svelte";
    import Grid from "../layout/grid.svelte";

    export let article: ArticleResponseExpanded = {
        id: "",
        name: "",
        reference: "",
        manufacturer: "",
        quantity: 0,
        price: 0,
        order_quantity: 0,
        consumable: false,
        critical_quantity: 0,
        unit: "",
        supplier: [],
        store: "",
        non_physical: false
    };

    let suppliers: SuppliersResponse[] = [];
    let stores: StoresResponse[] = [];

    onMount(async () => {

        if(!browser)
            return;
        try {
            suppliers = await $page.data.pb.collection(Collections.Suppliers).getFullList<SuppliersResponse>();
            stores = await $page.data.pb.collection(Collections.ArticleStores).getFullList<ArticleStoresResponse>();          
        }
        catch(ex)
        {
            console.log(ex);
        }
    })

</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6">

    <section class="flex flex-col gap-2 {article.non_physical ? "md:col-span-2" : ""}">
        <h3 class="mb-2">Informations de base</h3>
    
        <FormInput name="name" label="Nom de l'article" labelMandatory={true} bind:value={article.name} />
    
        <FormInput type="select" name="supplier" label="Fournisseur" bind:value={article.supplier} multiple={true}>
            {#each suppliers as supplier}
                <option value={supplier.id} selected={article?.supplier?.includes(supplier.id)}>{supplier.name}</option>
            {/each}
        </FormInput>
    
        <FormInput type="checkbox" name="non_physical" label="Article non physique" bind:checked={article.non_physical} />
    </section>
    
    
    {#if article.non_physical === false}

        <section class="flex flex-col gap-2">
            <h3 class="mb-2">Information techniques</h3>

            <FormInput name="reference" label="Référence" bind:value={article.reference} />
            <FormInput name="manufacturer" label="Fabricant" bind:value={article.manufacturer} />
        </section>

        <section class="flex flex-col gap-2">
            <h3 class="mb-2">Informations d'achat</h3>
    
            <FormInput type="number" name="order_quantity" label="Quantité minimale de commande" bind:value={article.order_quantity} min={article?.unit === "" ? 1 : 0.01} step={article?.unit === "" ? 1 : 0.01} />
            <FormInput type="number" name="critical_quantity" label="Quantité critique" bind:value={article.critical_quantity} step={article?.unit === "" ? 1 : 0.01} />
            <FormInput type="number" name="price" label="Prix d'achat temporaire" bind:value={article.price} step={0.01} min={0} />
    
            <FormInput type="checkbox" name="consumable" label="Consommable" bind:checked={article.consumable} />
        </section>

        <section class="flex flex-col gap-2">
            <h3 class="mb-2">Conditionement</h3>

            <Grid cols={article?.unit?.startsWith("b") ? 2 : 1}>
                <FormInput type="select" name="unit" label="Unité d'oeuvre" bind:value={article.unit}>
                    <option value="">Unité</option>
                    <option value="ml">Metre linéaire</option>
                    <option value="kg">Kilogramme</option>
                    <option value="g">Gramme</option>
                    <option value="l">Litre</option>
                    <option value="bu">Boite</option>
                    <option value="bl">Bouteille (Litres)</option>
                    <option value="bml">Bouteille (MilliLitres)</option>
                    <option value="bg">Bouteille (Grammes)</option>
                </FormInput>
            
                {#if article?.unit?.startsWith("b")}
                    <FormInput type="number" name="unit_quantity" label="Quantité du contenant" bind:value={article.unit_quantity} step={1} min={1} labelMandatory />
                {/if}
            </Grid>
        </section>
    {/if}
</div>