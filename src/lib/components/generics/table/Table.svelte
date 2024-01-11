<script lang="ts">
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import SortButton from "$lib/components/generics/table/SortButton.svelte";
    import { ArrowLeft, ArrowRight } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";
    import { convertTableSortToPrismaSort, type TableSort } from "$lib/components/generics/table/tableSort";

    type headerTypes = "selectAll" | { label: string, colname?: string };

    /// - INPUT DATA

    /** Headers used on this table */
    export let headers: Array<headerTypes | undefined> | undefined = undefined;

    /** 
     * Number of columns to be defined
     * @note This is only used if headers is undefined
     */
    export let cols: number = 0;

    /// - OUTPUT DATA

    /** Active sorting JSON Stringified & Base 64 Encoded */
    export let sort: string = "";

    /** Active sorts defined by the user */
    export let sorts: Array<TableSort> = [];

    /** Are all fields selected ? */
    export let allSelected = false;

    /** Selectable elements */
    export let selectables: Array<string> = [];
    
    /** Selected elements */
    export let selected: Array<string> = [];

    const dispatch = createEventDispatcher<{ sort: string }>();

    let parentContainer: HTMLDivElement;

    const filterUndefined = (value: any): value is headerTypes => value !== undefined;

    $: sort = btoa(JSON.stringify(sorts)), dispatch("sort", convertTableSortToPrismaSort(sorts));

    $: columns = headers === undefined ? cols : headers.filter(h => h !== undefined).length;

    $: allSelected = (selectables.length === selected.length) && selectables.length !== 0;

    $: contentScrollable = parentContainer?.scrollWidth ?? 0 > parentContainer?.clientWidth ?? 1;

    $: shouldScrollLeft = (parentContainer?.scrollLeft ?? 0) > 0;
    $: shouldScrollRight = (parentContainer?.scrollLeft ?? 0) < (parentContainer?.scrollWidth - parentContainer?.clientWidth ?? 0);

    const computeScrolls = () => {
        shouldScrollLeft = (parentContainer?.scrollLeft ?? 0) > 0;
        shouldScrollRight = (parentContainer?.scrollLeft ?? 0) < (parentContainer?.scrollWidth - parentContainer?.clientWidth ?? 0);
    }

</script>

<svelte:window on:resize={computeScrolls} />

<div class="bg-zinc-800 ring-1 ring-zinc-400/25 rounded-md relative mt-6 {$$props.class || ''}" class:overflow-x-scroll={contentScrollable} bind:this={parentContainer} on:scroll={computeScrolls}>

    <div class="sticky top-0 right-0 left-0 bottom-0 z-50">
        {#if shouldScrollRight}
            <button 
                in:fade
                out:fade
                on:click={() => parentContainer.scroll({ left: parentContainer.scrollWidth, behavior: "smooth" })}
                class="absolute flex flex-col items-center p-4 w-16 h-16 top-0 bottom-0 rounded-xl right-0 bg-gradient-to-r from-transparent via-zinc-200/50 to-zinc-400/75 hover:via-zinc-200/75 hover:to-zinc-400">
                <Icon src={ArrowRight} class="h-5 w-5 text-zinc-900 my-auto" />
            </button>     
        {/if}

        {#if shouldScrollLeft}
            <button 
                in:fade
                out:fade
                on:click={() => parentContainer.scroll({ left: 0, behavior: "smooth" })}
                class="absolute flex flex-col items-center p-4 w-16 h-16 top-0 bottom-0 rounded-xl left-0 bg-gradient-to-l from-transparent via-zinc-200/50 to-zinc-400/75 hover:via-zinc-200/75 hover:to-zinc-400">
                <Icon src={ArrowLeft} class="h-5 w-5 text-zinc-900 my-auto" />
            </button>
        {/if}
    </div>

    <div 
        class="grid items-end"
        style={`grid-template-columns: ${headers?.includes("selectAll") ? `4em repeat(${columns - 1}, minmax(min-content, 1fr));` : `repeat(${columns}, minmax(min-content, 1fr));`}`}
    >
        {#if headers !== undefined}
            {#each headers.filter(filterUndefined) as header}
                <div
                    class="p-4 border-b-2 border-b-zinc-600/75 {header === "selectAll" ? "text-center" : "text-left"}"
                >
                    {#if header === "selectAll"}
                        <input type="checkbox" bind:checked={allSelected} on:click={() => selected = (allSelected) ? [] : selectables} class="self-center" />
                    {:else}
                        <Flex items="center" gap={1}>
                            <span class="font-semibold truncate">{header.label}</span>
                            {#if header.colname !== undefined}
                                <SortButton colname={header.colname} on:sort={(e) => {
                                    sorts = sorts.filter(s => s.name !== e.detail.colname);

                                    if(e.detail.direction === "none")
                                        return;
                                    
                                    sorts = [...sorts, { name: e.detail.colname, direction: e.detail.direction }];
                                }} />
                            {/if}
                        </Flex>
                    {/if}
                </div>
            {/each}
        {/if}
        
        <slot />
    </div>
</div>