<script lang="ts" context="module">

    export type ArticleResponseExpanded = ArticleResponse<{
        "article_fabrication_quantity(article)": [{ quantity: number }],
        "article_order_quantity(article)": [{ quantity: number }],
        "article_store_quantity(article)": [{ quantity: number }],
        "article_price(article)": [{ price: number}]
    }>;

    export const articleResponseExpand = `article_fabrication_quantity(article),article_order_quantity(article),article_store_quantity(article),article_price(article)`;

</script>

<script lang="ts">
    import { browser } from "$app/environment";
    import { VideoCameraSlash } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    
    import DetailLabel from "../DetailLabel.svelte";
    import Flex from "../layout/flex.svelte";
    import type { ArticleResponse } from "$lib/DBTypes";
    import { returnArticleUnit } from "./artictleUnits";
    import Price from "../formatters/Price.svelte";

    import { env } from "$env/dynamic/public";

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

    $: articleQuantity = article.expand?.["article_store_quantity(article)"]?.at(0)?.quantity ?? 0;
    $: approxQuantity = article.expand?.["article_order_quantity(article)"]?.at(0)?.quantity ?? 0;
    $: fabricationQuantity = article.expand?.["article_fabrication_quantity(article)"]?.at(0)?.quantity ?? 0;
    $: articlePrice = article.expand?.["article_price(article)"]?.at(0)?.price ?? article.price ?? 0;

</script>

<Flex items="center" class="min-w-[30em]">

    {#if displayThumb === true && article.pinned_file !== undefined && article.attached_files?.includes(article.pinned_file) && browser}
        <img src="http://{env.PUBLIC_POCKETBASE_ADDRESS}/api/files/{article.collectionName}/{article.id}/{article.pinned_file}?thumb=200x200" alt={article.pinned_file} class="aspect-square object-cover h-20 rounded-md border border-zinc-500/50" />
    {:else}
        <div class="aspect-square object-cover h-20 rounded-md border border-zinc-500/50">
            <Icon src={VideoCameraSlash} class="h-10 w-10 m-5 text-red-500" />
        </div>
    {/if}

    <div>
        <a href="/app/scm/articles/{article.id}" class="block">{article.name}</a>
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
