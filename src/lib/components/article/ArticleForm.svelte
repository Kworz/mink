<script lang="ts">
    import FormInput from "../FormInput.svelte";
    import Grid from "../layout/grid.svelte";
    import { env } from "$env/dynamic/public";
    import type { SCMArticle } from "@prisma/client";

    export let article: SCMArticle = {
        id: "",

        name: "",
        reference: "",
        brand: "",

        order_quantity: 0,
        critical_quantity: 0,

        internal: false,
        consumable: false,
        non_physical: false,

        unit: "",
        unit_quantity: 0,
        
        thumbnail: null
    };

</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6">

    <section class="flex flex-col gap-2 {article.non_physical ? "md:col-span-2" : ""}">
        <h3 class="mb-2">Informations de base</h3>
    
        <FormInput name="name" label="Nom de l'article" labelMandatory={true} bind:value={article.name} />    
        <FormInput type="checkbox" name="non_physical" label="Article non physique" bind:checked={article.non_physical} />
        <FormInput type="checkbox" name="internal" label="Article interne" bind:checked={article.internal} />
    </section>
    
    
    {#if article.non_physical === false}

        <section class="flex flex-col gap-2">
            <h3 class="mb-2">Information techniques</h3>

            <FormInput name="reference" label="Référence" bind:value={article.reference} />
            {#if article.internal === false}
                <FormInput name="brand" label="Fabricant" bind:value={article.brand} />
            {:else}
                <p>Fabricant: {env.PUBLIC_COMPANY_NAME}</p>
            {/if}
        </section>

        {#if article.internal === false}
            <section class="flex flex-col gap-2">
                <h3 class="mb-2">Informations d'achat</h3>
        
                <FormInput type="number" name="order_quantity" label="Quantité minimale de commande" bind:value={article.order_quantity} min={article?.unit === "" ? 1 : 0.01} step={article?.unit === "" ? 1 : 0.01} />
                <FormInput type="number" name="critical_quantity" label="Quantité critique" bind:value={article.critical_quantity} step={article?.unit === "" ? 1 : 0.01} />
        
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
    {/if}
</div>