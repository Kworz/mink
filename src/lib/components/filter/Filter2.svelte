<script lang="ts">
    import { Check } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { convertFilterCondition, predictField, type Filter, type FilterCondition, converToPrismaFilter, type PrismaFilter, appendFilter } from "./filter2";
    import FilterLabel from "./FilterLabel.svelte";
    import Input from "../Input.svelte";
    import Flex from "../layout/flex.svelte";
    import { createEventDispatcher } from "svelte";
    
    /// — INPUT DATA

    /** Filters available to the user, this enables predictive entries */
    export let availableFilters: Array<Filter> = [];

    /// — OUTPUT DATA

    /** Base 64 Encoded & Stringified JSON filter */
    export let filter: PrismaFilter = {};

    /** Raw Filters defined by the user */
    export let filters: FilterCondition[] = [];

    const dispatch = createEventDispatcher<{ filter: string }>();

    let inputElement: HTMLInputElement | undefined = undefined;
    let inputInvalid = false;
    let tempFilter: string = "";
    let suggestions: string[] = [];
    let selectedSuggestion = 0;

    const convertFilter = () => {

        try
        {
            const fc = convertFilterCondition(tempFilter, availableFilters);
            filter = appendFilter(tempFilter, filter, availableFilters);
            filters = [...filters, fc];
            tempFilter = "";
        }
        catch(ex)
        {
            inputInvalid = true;
            console.log(ex);
        }
    }

    const selectSuggestion = (index = selectedSuggestion) =>
    {
        const parts = tempFilter.split(" ");
        const part = parts.length - 1;

        parts[part] = suggestions[index];

        // Prevent adding a space in the last filter part
        if(parts.length < 3)
            parts[part] += " ";

        tempFilter = parts.join(" ");
    }

    const inputKeyUp = (e: KeyboardEvent) => {

        if(e.key === "Enter")
        {
            convertFilter();
            inputElement?.focus();
            e.preventDefault();
        }
        else if(e.key === "Tab" && suggestions[selectedSuggestion] !== undefined)
        {
            selectSuggestion();
            e.preventDefault();
        }
        else if(e.key === "Backspace" && tempFilter.length === 0)
        {
            if(filters.at(-1)?.hidden)
                return;
            
            filters = [...filters.slice(0, -1)];
            inputElement?.focus();
        }
        else if(e.key === "ArrowUp")
        {
            selectedSuggestion = (selectedSuggestion === 0) ? 0 : selectedSuggestion - 1;
            e.preventDefault();
        }
        else if(e.key === "ArrowDown")
        {
            selectedSuggestion = (suggestions.length - 1 > selectedSuggestion) ? selectedSuggestion + 1 : (suggestions.length - 1);
            e.preventDefault();
        }
    }

    $: filters, dispatch("filter", btoa(converToPrismaFilter(filters)));
    $: if(inputInvalid) { setTimeout(() => inputInvalid = false, 2500);}

    $: suggestions = predictField(tempFilter, availableFilters), selectedSuggestion = 0;
</script>

{JSON.stringify(filter, undefined, 4)}

<Flex direction="col" gap={2} class={$$props.class}>
    <Input bind:value={tempFilter} placeholder={"Filtre"} on:keydown={inputKeyUp} bind:input={inputElement}>
        <svelte:fragment slot="before">
            {#each Object.keys(filter) as f}
                {#if filter[f] instanceof Object && !(filter[f] instanceof Array)}
                    {#each Object.keys(filter[f]) as subkeys}
                        {subkeys}
                    {/each}
                {:else}
                    <span>{f} {filter[f]}</span>
                {/if}
            {/each}
            {#if filters.filter(k => k.hidden === undefined).length > 0}
                <Flex class="ml-2" gap={2}>
                    {#each filters.filter(k => k.hidden !== true) as filter, index}
                        <FilterLabel bind:filter on:click={() => { filters.splice(index, 1); filters = filters; }} />
                    {/each}
                </Flex>
            {/if}
        </svelte:fragment>
        <Flex gap={2} class="mr-2">
            <button on:click|preventDefault={convertFilter}>
                <Icon src={Check}  class="h-6 w-6 text-emerald-500 hover:text-emerald-500/75 duration-300"/>
            </button>
        </Flex>

        {#if suggestions.length > 0}
            <div class="absolute z-50 top-[calc(100%+1rem)] bg-zinc-700 p-3 drop-shadow-xl flex flex-col gap-2 border border-zinc-800/50 rounded-md text-sm">
                {#each suggestions as sg, index}
                    <button 
                        class:text-blue-500={selectedSuggestion === index}
                        class="text-left duration-100 hover:text-blue-400"
                        on:click={() => selectSuggestion(index)}
                    >
                        {sg}
                    </button>
                {/each}
            </div>
        {/if}
    </Input>
</Flex>