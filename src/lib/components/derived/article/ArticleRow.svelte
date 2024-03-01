<script lang="ts">
    import { browser } from "$app/environment";
    import { VideoCameraSlash } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    
    import DetailLabel from "$lib/components/generics/DetailLabel.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import Price from "$lib/components/generics/formatters/Price.svelte";

    import { page } from "$app/stores";
    import type { scm_articleWithIncludes } from "$lib/components/derived/article/article";
    import { _ } from "svelte-i18n";

    export let article: scm_articleWithIncludes;

    /** Wether the stock should be displayed or not */
    export let displayStock = false;

    /** Wether the `Inbound supplies` or manufacturing amount should be displayed or not */
    export let displayInboundSupplies = false;
    
    /** Wether the thumb image is displayed or not */
    export let displayThumb = true;

    /** Wether the supplier and price are displayed */
    export let displayPrice = true;

    /** Wether the manufacturer and reference are displayed */
    export let displayManufacturer = true;

    $: articleQuantity = article.store_relations.filter(sr => sr.store.assemblies_buylist === null).reduce((p, c) => p = p + c.quantity, 0);
    $: inboundQuantity = article.order_rows.filter(or => !(["draft", "canceled"].includes(or.order.state))).reduce((p, c) => p = p + (c.needed_quantity - c.received_quantity), 0);
    $: articlePrice = article.order_rows.filter(or => !(["draft", "canceled"].includes(or.order.state))).filter(or => or.ack_price !== null).reduce((p, c) => p = p + (c.ack_price as number) * c.received_quantity, 0);
    $: manufacturingQuantity = 0;

</script>

<Flex items="center" class="min-w-[10em] 2xl:min-w-[30em]">

    {#if displayThumb === true && article.thumbnail && browser}
        <img src={article.thumbnail} alt={`Miniature ${article.name}`} class="aspect-square object-cover h-20 rounded-md border border-zinc-500/50" />
    {:else}
        <div class="aspect-square object-cover h-20 rounded-md border border-zinc-500/50">
            <Icon src={VideoCameraSlash} class="h-10 w-10 m-5 text-red-500" />
        </div>
    {/if}

    <div>
        <a href="/app/scm/articles/{article.id}" class="block">{article.name}</a>
        {#if displayManufacturer}<span class="text-sm block">{(article.internal) ? $page.data.appSettings.company_name : article.brand}: <DetailLabel>{article.reference}</DetailLabel></span>{/if}
        {#if displayPrice}<span class="text-sm block"><DetailLabel><Price value={articlePrice} /></DetailLabel></span>{/if}
        {#if articleQuantity > 0 && displayStock === true}
            {@const shouldOrder = articleQuantity < (article.critical_quantity ?? 0)}
            <span class="text-sm block" class:text-red-500={shouldOrder} class:text-emerald-500={!shouldOrder}>
                {$_(`app.generic.units_of_work_number.${article.unit}`, {values: { n: articleQuantity / (article.unit_quantity ?? 1), b: article.unit_quantity }})}
                {$_('app.generic.in_stock')}
            </span>
        {/if}
        {#if inboundQuantity > 0 && displayInboundSupplies === true}
            <span class="text-sm text-amber-500 block">
                {$_(`app.generic.units_of_work_number.${article.unit}`, {values: { n: inboundQuantity / (article.unit_quantity ?? 1), b: article.unit_quantity }})}
                {$_('app.generic.in_inbounds')}
            </span>
        {/if}
        {#if manufacturingQuantity > 0 && displayInboundSupplies === true}
            <span class="text-sm text-amber-700 block">
                {$_(`app.generic.units_of_work_number.${article.unit}`, {values: { n: manufacturingQuantity / (article.unit_quantity ?? 1), b: article.unit_quantity }})}
                {$_('app.generic.in_manufacturing')}
            </span>
        {/if}
    </div>
</Flex>
