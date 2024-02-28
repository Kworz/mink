<script lang="ts">
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import { page } from "$app/stores";
    import { _ } from "svelte-i18n";
    import { unit_of_work } from "$lib/prisma-enums";
    import type { scm_article } from "@prisma/client";

    export let article: scm_article = {
        id: "",

        name: "",
        reference: "",
        brand: "",

        order_quantity: 1,
        critical_quantity: 0,

        internal: false,
        consumable: false,
        non_physical: false,

        unit: "unit",
        unit_quantity: 0,
        
        thumbnail: null
    };

</script>

<div class="flex flex-col gap-3">

    <h3 class="mb-2">Informations de base</h3>
    <FormInput name="name" label={$_('app.generic.article_name')} required bind:value={article.name} />    
    <FormInput type="checkbox" name="non_physical" label={$_('app.generic.article_non_physical')} bind:checked={article.non_physical} />
    <FormInput type="checkbox" name="internal" label={$_('app.generic.internal_article')} bind:checked={article.internal} />

    {#if article.non_physical === false}

        <h3 class="mb-2 mt-3">{$_('app.generic.technical_data')}</h3>
        <FormInput name="reference" label={$_('app.generic.sku')} bind:value={article.reference} />
        {#if article.internal === false}
            <FormInput name="brand" label={$_('app.generic.brand')} bind:value={article.brand} />
        {:else}
            <p>{$_('app.generic.brand')}: {$page.data.appSettings.company_name}</p>
        {/if}

        <h3 class="mb-2 mt-3">{$_('app.generic.ordering_data')}</h3>
        <FormInput type="number" name="order_quantity" label={$_('app.generic.minimal_ordering_quantity')} bind:value={article.order_quantity} min={article.unit === "unit" ? 1 : (article.unit_quantity || 1)} step={article.unit === "unit" ? 1 : (article.unit_quantity || 1)} />
        <FormInput type="number" name="critical_quantity" label={$_('app.generic.critical_quantity')} bind:value={article.critical_quantity} step={article.unit === "unit" ? 1 : (article.unit_quantity || 1)} />
        <FormInput type="checkbox" name="consumable" label={$_('app.generic.consumable')} bind:checked={article.consumable} />
        
        <h3 class="mb-2 mt-3">{$_('app.generic.packaging_data')}</h3>

        <FormInput type="select" name="unit" label={$_(`app.generic.unit_of_work`)} required bind:value={article.unit}>
            {#each Object.keys(unit_of_work) as uow}
                <option value={uow}>{$_(`app.generic.units_of_work.${uow}`)}</option>
            {/each}
        </FormInput>
    
        {#if article?.unit.startsWith("c_")}
            <FormInput type="number" name="unit_quantity" label="Quantité du contenant" bind:value={article.unit_quantity} step={1} min={1} required />
        {/if}
    {/if}
</div>