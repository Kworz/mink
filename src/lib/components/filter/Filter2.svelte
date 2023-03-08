<script lang="ts">
    import { Check, XMark } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import Input from "../Input.svelte";
    import Flex from "../layout/flex.svelte";
    import { convertFilterCondition, convertToPocketbaseFilter, predictField, type Filter, type FilterCondition } from "./filter2";
    
    export let filter: string = "";
    export let filters: FilterCondition[] = [];

    let inputInvalid = false;
    let tempFilter: string = "";
    let suggestions: string[] = [];

    const availableFilters: Array<Filter> = [
        { name: "name", default: true },
        { name: "reference", shorthands: ["r", "ref"] },
        { name: "manufacturer", shorthands: ["m", "man"] },
        { name: "supplier.name", shorthands: ["s", "sup"] }
    ];

    const convertFilter = () => {
        try
        {
            const fc = convertFilterCondition(tempFilter, availableFilters);
            filters = [...filters, fc];
            tempFilter = "";
        }
        catch(ex)
        {
            inputInvalid = true;
            console.log(ex);
        }
    }

    const inputKeyUp = (e: KeyboardEvent) => {

        if(e.key === "Enter")
            convertFilter();
        else if(e.key === "Tab" && suggestions[0] !== undefined)
        {
            tempFilter = suggestions[0] + ":"
            e.preventDefault();
        }
        else if(e.key === "Backspace" && tempFilter.length === 0)
            filters = [...filters.slice(0, -1)];
    }

    $: filter = convertToPocketbaseFilter(filters);
    $: if(inputInvalid) { setTimeout(() => inputInvalid = false, 2500);}

    $: suggestions = predictField(tempFilter, availableFilters);

</script>

<Flex direction="col" gap={2}>
    <Input bind:value={tempFilter} placeholder={"Filtre"} borderColor={!inputInvalid ? "border-zinc-500/50" : "border-red-500"} on:keydown={inputKeyUp}>
        <svelte:fragment slot="before">
            {#if filters.length > 0}
                <Flex class="ml-2" gap={2}>
                    {#each filters as filter, index}
                        <div class="py-0.5 px-1 text-xs rounded-full bg-white ring-1 ring-zinc-500/50 flex flex-row items-center gap-1">
                            <span>{filter.field}:{filter.value}</span>
                            <button on:click={() => filters = filters.filter((k, i) => i !== index)}>
                                <Icon src={XMark} class="h-4 w-4 text-red-500 hover:text-red-500/75 duration-100" />
                            </button>
                        </div>
                    {/each}
                </Flex>
            {/if}
        </svelte:fragment>
        <Flex gap={2} class="mr-2">
            <button on:click={convertFilter}>
                <Icon src={Check}  class="h-6 w-6 text-emerald-500 hover:text-emerald-500/75 duration-300"/>
            </button>
        </Flex>

        {#if suggestions.length > 0}
            <div class="absolute z-50 top-[115%] bg-white p-2 flex flex-col gap-1 ring-1 ring-zinc-500/50 rounded-sm ring-inset text-xs">
                {#each suggestions as sg}
                    <span class="">{sg}</span>
                {/each}
            </div>
        {/if}
    </Input>
</Flex>