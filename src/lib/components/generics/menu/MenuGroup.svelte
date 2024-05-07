<script lang="ts">
    import type { ComponentProps } from "svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import MenuItem from "./MenuItem.svelte";

    export let items: Array<ComponentProps<MenuItem> | undefined> = [];

    /** Remove elements that are undefined, gets TS to work correctly */
    const filterUndefined = (i: ComponentProps<MenuItem> | undefined): i is ComponentProps<MenuItem> => i !== undefined;

    $: filteredItems = items.filter(filterUndefined);

</script>

{#if filteredItems.length > 0}
    <Flex items="center" class="hidden group-hover:flex mt-4 mb-2 {$$props.class || ""}">
        <span class="group-hover:inline-block hidden text-sm dark:text-zinc-800 text-white"><slot /></span>
        <div class="h-[1px] grow bg-violet-500/50" />
    </Flex>

    {#each filteredItems as item}
        <MenuItem {...item} />
    {/each}
{/if}