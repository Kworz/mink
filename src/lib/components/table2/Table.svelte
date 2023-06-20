<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Flex from "../layout/flex.svelte";
    import SortButton from "../table/SortButton.svelte";
    import { ArrowLeft, ArrowRight } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { fade } from "svelte/transition";

    export let headers: Array<"selectAll" | { label: string, colname?: string }> = [];
    export let activeSort: string | undefined = undefined;
    export let allSelected = false;

    export let selectables: Array<string> = [];
    export let selected: Array<string> = [];

    let parentContainer: HTMLDivElement;

    $: allSelected = selectables.length === selected.length;

    $: contentScrollable = parentContainer?.scrollWidth ?? 0 > parentContainer?.clientWidth ?? 1;

    $: shouldScrollLeft = (parentContainer?.scrollLeft ?? 0) > 0;
    $: shouldScrollRight = (parentContainer?.scrollLeft ?? 0) < (parentContainer?.scrollWidth - parentContainer?.clientWidth ?? 0);

    const computeScrolls = () => {
        shouldScrollLeft = (parentContainer?.scrollLeft ?? 0) > 0;
        shouldScrollRight = (parentContainer?.scrollLeft ?? 0) < (parentContainer?.scrollWidth - parentContainer?.clientWidth ?? 0);
    }

</script>

<svelte:window on:resize={computeScrolls} />

<div class="{$$props.class} relative" class:overflow-x-scroll={contentScrollable} bind:this={parentContainer} on:scroll={computeScrolls}>

    <div class="sticky top-0 right-0 left-0 bottom-0">
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
        style={`grid-template-columns: ${headers.includes("selectAll") ? `4em repeat(${headers.length - 1}, minmax(min-content, 1fr));` : `repeat(${headers.length}, minmax(min-content, 1fr));`}`}
    >
        {#each headers as header}
            <div class="p-4 border-b-2 border-b-violet-500/75 {header === "selectAll" ? "text-center" : "text-left"}">
                {#if header === "selectAll"}
                    <input type="checkbox" bind:checked={allSelected} on:click={() => selected = (allSelected) ? [] : selectables} class="self-center" />
                {:else}
                    <Flex items="center" gap={1} >
                        <span class="font-semibold truncate">{header.label}</span>
                        {#if header.colname !== undefined}
                            <SortButton direction="asc" active={header.colname === activeSort} on:click={() => activeSort = header.colname ?? ""} />
                            <SortButton direction="desc" active={`-${header.colname}` === activeSort} on:click={() => activeSort = `-${header.colname}`} />
                        {/if}
                    </Flex>
                {/if}
            </div>
        {/each}

        <slot />
    </div>
</div>