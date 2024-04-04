<script lang="ts">
    import { appendFilter, predictField, type Filter, type FilterSuggestion, type PrismaFilter, type PrismaFilterType } from "$lib/components/derived/filter/filter";
    import Input from "$lib/components/generics/inputs/Input.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import { Check } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { _ } from "svelte-i18n";
    import FilterLabel from "./FilterLabel.svelte";
    import FilterType from "./FilterType.svelte";
    
    /// — INPUT DATA

    /** Filters available to the user, this enables predictive entries */
    export let availableFilters: Array<Filter> = [];

    /// — OUTPUT DATA

    /** Base 64 Encoded & Stringified JSON filter */
    export let filter: PrismaFilter = {};

    let filterMode: PrismaFilterType = "AND";

    let inputElement: HTMLInputElement | undefined = undefined;
    let inputInvalid = false;
    let tempFilter: string = "";
    let suggestions: FilterSuggestion = { values: [] };
    let selectedSuggestion = 0;

    const convertFilter = () => {
        try
        {
            filter = appendFilter(tempFilter, filter, availableFilters, filterMode);
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

        parts[part] = suggestions.values[index];

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
        else if(e.key === "Tab" && suggestions.values[selectedSuggestion] !== undefined)
        {
            selectSuggestion();
            e.preventDefault();
        }
        else if(e.key === "ArrowUp")
        {
            selectedSuggestion = (selectedSuggestion === 0) ? 0 : selectedSuggestion - 1;
            e.preventDefault();
        }
        else if(e.key === "ArrowDown")
        {
            selectedSuggestion = (suggestions.values.length - 1 > selectedSuggestion) ? selectedSuggestion + 1 : (suggestions.values.length - 1);
            e.preventDefault();
        }
        else if(e.key === "Backspace" && tempFilter.length === 0)
        {
            filter[filterMode]?.pop();
            filter = filter;
        }
    }

    $: if(inputInvalid) { setTimeout(() => inputInvalid = false, 2500); }

    $: suggestions = predictField(tempFilter, availableFilters), selectedSuggestion = 0;
</script>

<Flex direction="col" gap={2} class={$$props.class}>
    <Input bind:value={tempFilter} placeholder={"Filtre"} on:keydown={inputKeyUp} bind:input={inputElement} invalid={inputInvalid}>
        <svelte:fragment slot="before">

            <select bind:value={filterMode} class="text-sm bg-transparent ml-2">
                <option value="OR">{$_('app.filter.or')}</option>
                <option value="AND">{$_('app.filter.and')}</option>
                <option value="NOT">{$_('app.filter.not')}</option>
            </select>

            {#each ["OR", "AND"] as key}
                {#if filter[key] !== undefined}
                    {#each filter[key] as filterElement, index}
                        {#if index !== 0}
                            <FilterType filterType="AND" />
                        {/if}
                        <FilterLabel filter={filterElement} />
                    {/each}
                {/if}
            {/each}
        </svelte:fragment>

        <Flex gap={2} class="mr-2">
            <button on:click|preventDefault={convertFilter}>
                <Icon src={Check}  class="h-6 w-6 text-emerald-500 hover:text-emerald-500/75 duration-300"/>
            </button>
        </Flex>

        {#if suggestions.values.length > 0}
            <div class="absolute z-50 top-[calc(100%+1rem)] bg-zinc-700 p-3 drop-shadow-xl flex flex-col gap-2 border border-zinc-800/50 rounded-md text-sm">
                {#each suggestions.values as suggestion, index}
                    <button 
                        class:text-blue-500={selectedSuggestion === index}
                        class="text-left duration-100 hover:text-blue-400"
                        on:click={() => selectSuggestion(index)}
                    >
                        {#if suggestions.type === undefined}
                            {suggestion}
                        {:else}
                            {$_(`app.filter.${suggestions.type}.${suggestion}`)}
                        {/if}
                    </button>
                {/each}
            </div>
        {/if}
    </Input>
</Flex>