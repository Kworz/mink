<script lang="ts">
    import { Check } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { convertFilterCondition, convertToPocketbaseFilter, predictField, type Filter, type FilterCondition } from "./filter2";
    import FilterLabel from "./FilterLabel.svelte";
    import Input from "../Input.svelte";
    import Flex from "../layout/flex.svelte";
    
    export let filter: string = "";
    export let filters: FilterCondition[] = [];
    export let availableFilters: Array<Filter> = [];

    let inputInvalid = false;
    let tempFilter: string = "";
    let suggestions: string[] = [];
    let selectedSuggestion = 0;

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

    const selectSuggestion = (index = selectedSuggestion) =>
    {
        const parts = tempFilter.split(" ");
        const part = parts.length - 1;

        parts[part] = suggestions[index] + " ";
        tempFilter = parts.join(" ");
    }

    const inputKeyUp = (e: KeyboardEvent) => {

        if(e.key === "Enter")
        {
            convertFilter();
            e.preventDefault();
        }
        else if(e.key === "Tab" && suggestions[selectedSuggestion] !== undefined)
        {
            selectSuggestion();
            e.preventDefault();
        }
        else if(e.key === "Backspace" && tempFilter.length === 0)
            filters = [...filters.slice(0, -1)];
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

    $: filter = convertToPocketbaseFilter(filters);
    $: if(inputInvalid) { setTimeout(() => inputInvalid = false, 2500);}

    $: suggestions = predictField(tempFilter, availableFilters), selectedSuggestion = 0;

</script>

<Flex direction="col" gap={2}>
    <Input bind:value={tempFilter} placeholder={"Filtre"} on:keydown={inputKeyUp}>
        <svelte:fragment slot="before">
            {#if filters.length > 0}
                <Flex class="ml-2" gap={2}>
                    {#each filters.filter(k => k.hidden !== true) as filter, index}
                        <FilterLabel bind:filter on:click={() => filters = filters.filter((k, i) => i !== index)} />
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
            <div class="absolute z-50 top-[calc(100%+1rem)] bg-gray-200 dark:bg-zinc-700 p-3 drop-shadow-xl flex flex-col gap-2 border dark:border-zinc-800/50 rounded-md text-sm">
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