<script context="module" lang="ts">
    import type { NomenclatureRowResponseExpanded } from "../../../../routes/app/nomenclatures/[id]/+page.server";

    export type NomenclatureNestGroup = {
        name: string;
        items: Array<{
            nomenclature_row: NomenclatureRowResponseExpanded,
            quantity: number
        }>;
        subGroups: Array<NomenclatureNestGroup>;
    };
    
</script>

<script lang="ts">
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { ChevronDown, ChevronRight } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import ArticleRow from "../../article/ArticleRow.svelte";
    import Flex from "../../layout/flex.svelte";
    import Wrapper2 from "../../Wrapper2.svelte";

    export let nestGroup: NomenclatureNestGroup;
    export let nested = false;

    let showArticles = true;
    let showSubGroups = true;

    $: titleClass = nested ? "before:contents-[''] before:absolute before:-left-[41px] before:top-1 dark:before:bg-white before:bg-zinc-800 before:border-[6px] dark:before:border-zinc-800 before:border-white before:h-5 before:w-5 before:rounded-full after:contents-[''] after:absolute after:h-[1px] after:w-4 after:-left-6 after:bg-zinc-800 after:dark:bg-white/50 after:top-[13px]" : "";

</script>

<div class="mt-4">
    <h4 class="mb-4 capitalize relative {titleClass}">{nestGroup.name.split(".").join(" → ")}</h4>

    <div class="ml-12 flex flex-col gap-4 items-start relative before:contents-[''] before:absolute before:block dark:before:bg-white/50 before:bg-zinc-700 before:w-[1px] before:h-full before:-left-8">

        {#if nestGroup.subGroups.length > 0}
            <button on:click={() => showSubGroups = !showSubGroups} class="-translate-x-12 hover:text-violet-500 duration-100">
                <Icon src={showSubGroups ? ChevronDown : ChevronRight} class="h-8 w-8 inline dark:bg-zinc-800 bg-white rounded-full p-1" />
                Sous groupes ({nestGroup.subGroups.length})
            </button>
        
            {#if showSubGroups}
                <Flex direction="col" gap={4} class="w-full">
                    {#each nestGroup.subGroups as subGroup}
                        <svelte:self nestGroup={subGroup} nested={true} />
                    {/each}
                </Flex>
            {/if}
        {/if}

        {#if nestGroup.items.length > 0}
            <button on:click={() => showArticles = !showArticles} class="-translate-x-12 hover:text-violet-500 duration-100">
                <Icon src={showArticles ? ChevronDown : ChevronRight} class="h-8 w-8 inline dark:bg-zinc-800 bg-white rounded-full p-1" />
                Articles ({nestGroup.items.length})
            </button>
    
            {#if showArticles}
                <Flex direction="col" gap={4} class="w-full">
                    {#each nestGroup.items as item}
                        <Wrapper2 class="w-full">
                            <form action="?/editItem" method="post" use:enhanceNoReset>
                                <Flex items="center">
                                    <ArticleRow article={item.nomenclature_row.expand?.child_article} />
                                    <input type="hidden" name="row_id" value={item.nomenclature_row.id} />
                                    <div class="grow"></div>
                                    <span>{item.quantity}</span>
                                </Flex>
                            </form>
                        </Wrapper2>
                    {/each}
                </Flex>
            {/if}
        {/if}
    </div>
</div>