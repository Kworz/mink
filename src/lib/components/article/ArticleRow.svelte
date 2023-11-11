<script lang="ts" context="module">
    type SCMArticleWithIncludes = Prisma.SCMArticleGetPayload<{
        include: {
            store_relations: {
                include: {
                    store: true
                }
            },
            order_rows: {
                include: {
                    order: true
                }
            }
        }
    }>;
</script>

<script lang="ts">
    import { browser } from "$app/environment";
    import { VideoCameraSlash } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    
    import DetailLabel from "../DetailLabel.svelte";
    import Flex from "../layout/flex.svelte";
    import { returnArticleUnit } from "./artictleUnits";
    import Price from "../formatters/Price.svelte";

    import type { Prisma } from "@prisma/client";
    import { page } from "$app/stores";

    export let article: SCMArticleWithIncludes;

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

    $: articleQuantity = article.store_relations.filter(sr => !sr.store.temporary).reduce((p, c) => p = p + c.quantity, 0);
    $: approxQuantity = article.order_rows.filter(or => !(["draft", "canceled"].includes(or.order.state))).reduce((p, c) => p = p + (c.needed_quantity - c.received_quantity), 0);
    $: articlePrice = article.order_rows.filter(or => !(["draft", "canceled"].includes(or.order.state))).filter(or => or.ack_price !== null).reduce((p, c) => p = p + (c.ack_price as number) * c.received_quantity, 0);
    $: fabricationQuantity = 0;

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
        {#if displayManufacturer}<span class="text-sm block">{(article.internal) ? $page.data.settings.appCompanyName : article.brand}: <DetailLabel>{article.reference}</DetailLabel></span>{/if}
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
