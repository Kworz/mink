<script lang="ts">
    import { browser } from "$app/environment";
    import { VideoCameraSlash } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";

    import type { ArticleResponseExpanded } from "../../../routes/app/articles/+page.server";
    
    import DetailLabel from "../DetailLabel.svelte";
    import Flex from "../layout/flex.svelte";
    import { FabricationOrdersStateOptions, OrdersStateOptions } from "$lib/DBTypes";
    import { returnArticleUnit } from "./artictleUnits";
    import Price from "../formatters/Price.svelte";

    export let article: ArticleResponseExpanded;

    /** Wether the stock should be displayed or not */
    export let displayStock = false;

    /** Wether the approx or fabrication amount should be displayed or not */
    export let displayApprox = false;
    
    /** Wether the thumb image is displayed or not */
    export let displayThumb = true;

    /** Wether the supplier and price are displayed */
    export let displayPrice = true;

    /** Wether the manufacturer and reference are displayed */
    export let displayManufacturer = true;

    $: articleQuantity = (article.expand?.["stores_relations(article)"]?.filter(s => s.expand?.store.temporary === false).reduce((p, c) => p + (c.quantity ?? 0), 0)) ?? 0;
    $: approxQuantity = (article.expand?.["orders_rows(article)"]?.filter(k => [OrdersStateOptions.placed, OrdersStateOptions.acknowledged].includes(k.expand?.order.state)).map(k => k.quantity - (k.quantity_received ?? 0)).reduce((c, p) => p = c+p, 0)) ?? 0;
    $: fabricationQuantity = (article.expand?.["fabrication_orders(article)"]?.filter(k => [FabricationOrdersStateOptions.started, FabricationOrdersStateOptions.asked].includes(k.state)))?.map(k => k.quantity).reduce((c, p) => p = c+p, 0) ?? 0;
    $: articlePrice = article.expand?.["orders_rows(article)"] !== undefined ? (article.expand?.["orders_rows(article)"]?.reduce((p, c) => p = p + (c.ack_price ?? 0) * c.quantity, 0) / article.expand?.["orders_rows(article)"]?.reduce((p, c) => p = p + c.quantity, 0)) : article.price;

</script>

<Flex items="center">

    {#if displayThumb === true && article.pinned_file !== undefined && article.attached_files?.includes(article.pinned_file) && browser}
        <img src="http://{window.location.hostname}:8090/api/files/{article.collectionName}/{article.id}/{article.pinned_file}?thumb=200x200" alt={article.pinned_file} class="aspect-square object-cover h-20 rounded-md border border-zinc-500/50" />
    {:else}
        <div class="aspect-square object-cover h-20 rounded-md border border-zinc-500/50">
            <Icon src={VideoCameraSlash} class="h-10 w-10 m-5 text-red-500" />
        </div>
    {/if}

    <div>
        <a href="/app/articles/{article.id}" class="block">{article.name}</a>
        {#if displayManufacturer}<span class="text-sm block">{article.manufacturer}: <DetailLabel>{article.reference}</DetailLabel></span>{/if}
        {#if displayPrice}<span class="text-sm block"><DetailLabel><Price value={articlePrice} /></DetailLabel></span>{/if}
        {#if articleQuantity > 0 && displayStock === true}
            {@const shouldOrder = articleQuantity < (article.critical_quantity ?? 0)}
            <span class="text-sm block" class:text-red-500={shouldOrder} class:text-emerald-500={!shouldOrder}>{returnArticleUnit(article.unit, article.unit_quantity, articleQuantity)} en stock.</span>
        {/if}
        {#if approxQuantity > 0 && displayApprox === true}
            <span class="text-sm text-amber-500 block">{returnArticleUnit(article.unit, article.unit_quantity, approxQuantity)} en approvisionement.</span>
        {/if}
        {#if fabricationQuantity > 0 && displayApprox === true}
            <span class="text-sm text-amber-700 block">{returnArticleUnit(article.unit, article.unit_quantity, fabricationQuantity)} en fabrication.</span>
        {/if}
    </div>
</Flex>
