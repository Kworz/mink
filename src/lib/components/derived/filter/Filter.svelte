<script lang="ts">
    import { appendFilter, predictField, type Filter, type FilterSuggestion, type PrismaFilter } from "$lib/components/derived/filter/filter";
    import Button from "$lib/components/generics/Button.svelte";
    import Input from "$lib/components/generics/inputs/Input.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import Modal from "$lib/components/generics/modal/Modal.svelte";
    import { Check, Funnel } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { _ } from "svelte-i18n";
    
    /// — INPUT DATA

    /** Filters available to the user, this enables predictive entries */
    export let availableFilters: Array<Filter> = [];

    /// — OUTPUT DATA

    /** Base 64 Encoded & Stringified JSON filter */
    export let filter: PrismaFilter = {};

    let inputElement: HTMLInputElement | undefined = undefined;
    let inputInvalid = false;
    let tempFilter: string = "";
    let suggestions: FilterSuggestion = { values: [] };
    let selectedSuggestion = 0;

    let showCompleteFilter = false;

    const convertFilter = () => {
        try
        {
            filter = appendFilter(tempFilter, filter, availableFilters);
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
    }

    $: if(inputInvalid) { setTimeout(() => inputInvalid = false, 2500); }

    $: suggestions = predictField(tempFilter, availableFilters), selectedSuggestion = 0;
</script>

{#if showCompleteFilter}
    <Modal title="Filter" on:close={() => showCompleteFilter = false}>
        {#each Object.keys(filter) as filterField, i}
            <h3>{$_('app.filter.filter_condition', { values: { n: i + 1 }})}: <code>{filterField}</code>.</h3>
            <ul>
                {#if filter[filterField] instanceof Object && !(filter[filterField] instanceof Array)}
                    {#each Object.entries(filter[filterField]) as [key, value]}
                        <li class="flex flex-row justify-between">
                            <span>{$_('app.filter.operands.' + key)}: <code>{value}</code>.</span>
                            <Button size="small" role="danger" on:click={() => { delete filter[filterField][key]; if(Object.keys(filter[filterField]).length === 0) { delete filter[filterField]; } filter = filter; showCompleteFilter = !(Object.keys(filter).length === 0) } }>{$_('app.action.delete')}</Button>
                        </li>
                    {/each}
                {:else}
                    <li>{filterField} {filter[filterField]}</li>
                {/if}
            </ul>
        {/each}
    </Modal>
{/if}

<Flex direction="col" gap={2} class={$$props.class}>
    <Input bind:value={tempFilter} placeholder={"Filtre"} on:keydown={inputKeyUp} bind:input={inputElement} invalid={inputInvalid}>
        <svelte:fragment slot="before">
            {#if Object.keys(filter).length > 0}
                <button on:click|preventDefault={() => showCompleteFilter = true} class="text-violet-500 hover:text-violet-500/75 duration-100 text-sm flex flex-row items-center gap-1 ml-2">
                    <Icon src={Funnel} class="h-5 w-5"/>
                    {$_('app.filter.edit_filter')}
                </button>
            {/if}
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