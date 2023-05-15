<script lang="ts">
    import { browser } from "$app/environment";
    import { VideoCameraSlash } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";

    import type { ArticleResponseExpanded } from "../../../routes/app/articles/+page.server";
    
    import DetailLabel from "../DetailLabel.svelte";
    import Flex from "../layout/flex.svelte";
    import { OrdersStateOptions } from "$lib/DBTypes";
    import { returnArticleUnit } from "./artictleUnits";

    export let article: ArticleResponseExpanded;

    /** Wether the stock should be displayed or not */
    export let displayStock = false;

    /** Wether the approx amount should be displayed or not */
    export let displayApprox = false;
    
    /** Wether the thumb image is displayed or not */
    export let displayThumb = true;

    /** Wether the supplier and price are displayed */
    export let displayPrice = true;

    /** Wether the manufacturer and reference are displayed */
    export let displayManufacturer = true;

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
        {#if displayPrice}<span class="text-sm block"><DetailLabel>{article.price} €</DetailLabel></span>{/if}
        {#if (article.quantity ?? 0) > 0 && displayStock === true}
            {@const shouldOrder = (article.quantity ?? 0) < (article.critical_quantity ?? 0)}
            <span class="text-sm block" class:text-red-500={shouldOrder} class:text-emerald-500={!shouldOrder}>{article.quantity} {returnArticleUnit(article.unit, article.unit_quantity)} en stock.</span>
        {/if}
        {#if article.expand?.["orders_rows(article)"] !== undefined && displayApprox === true}
            {@const amount = article.expand?.["orders_rows(article)"].filter(k => [OrdersStateOptions.placed, OrdersStateOptions.acknowledged].includes(k.expand?.order.state)).map(k => k.quantity - (k.quantity_received ?? 0)).reduce((c, p) => p = c+p, 0)}
            {#if amount > 0}
                <span class="text-sm text-amber-500 block">{amount} En approvisionement.</span>
            {/if}
        {/if}
    </div>
</Flex>
