<script context="module" lang="ts">

    export type NomenclatureGroup = {
        group: string,
        attributed_quantity: number
    }

    export const convertToNomenclatureGroup = (value: string, maxQuantity: number, groups: NomenclatureGroup[] = []): NomenclatureGroup => {

        if(value.length === 0)
            throw "Group not defined";

        const alreadyPrensentQuantity = groups.reduce((p, c) => p = p + c.attributed_quantity, 0);

        const parts = value.split(":");
        const futureAttributedQuantity = (parts.length === 1) ? (maxQuantity - alreadyPrensentQuantity) : Number(parts[1]);

        if(futureAttributedQuantity <= 0)
            throw "Group quantity cannot be negative or zero";

        const attributedQuantity = groups.reduce((p, c) => p = p + c.attributed_quantity, futureAttributedQuantity);

        if(attributedQuantity > maxQuantity)
            throw "Cant add too much quantity";

        return {
            group: parts[0],
            attributed_quantity: futureAttributedQuantity
        }
    }

    export const convertGroupsToString = (groups: NomenclatureGroup[]): string => {
        return groups.map(g => `${g.group}:${g.attributed_quantity}`).join(",");
    }

</script>

<script lang="ts">
    import { Check } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { onMount } from "svelte";
    import Input from "../Input.svelte";
    import Flex from "../layout/flex.svelte";
    import NomenclatureGroupLabel from "./NomenclatureGroupLabel.svelte";

    export let group: string | undefined;
    export let quantityToAttribute: number;

    export let validateOnChange = false;
    let validateButton: HTMLButtonElement | undefined;
    let hiddenElement: HTMLInputElement | undefined;

    let tempGroup = "";
    let groups: NomenclatureGroup[] = [];

    onMount(() => {

        if(group === undefined)
            return;
        
        let ng: NomenclatureGroup[] = [];

        group.split(",").forEach(g => {
            try
            {
                const ng2 = convertToNomenclatureGroup(g, quantityToAttribute, ng);
                ng = [...ng, ng2];
            }
            catch(ex)
            {
                console.log(ex);
                console.log("load", ng);
            }
        });

        groups = ng;
    });

    const convertNomGroup = () => {
        try
        {
            const ng = convertToNomenclatureGroup(tempGroup, quantityToAttribute, groups);
            groups = [...groups, ng];
            tempGroup = "";
        }
        catch(ex)
        {
            console.log(ex);
        }
    }

    const inputKeyUp = async  (e: KeyboardEvent) => {

        if(e.key === "Enter")
        {
            convertNomGroup();
            e.preventDefault();
        }
        else if(e.key === "Backspace" && tempGroup.length === 0)
        {
            groups = [...groups.slice(0, -1)];
        }
        else
            return;

        group = convertGroupsToString(groups);

        hiddenElement!.value = group;

        if(validateOnChange)
            validateButton?.click();
    }

    $: allAttributed = quantityToAttribute >= groups.reduce((p,c) => p + c.attributed_quantity, 0);

</script>

<Flex direction="col" gap={2}>
    <input type="hidden" name="group" bind:this={hiddenElement} />
    <Input bind:value={tempGroup} placeholder={"Groupe"} on:keydown={inputKeyUp}>
        <svelte:fragment slot="before">
            {#if groups.length > 0}
                <Flex gap={2} class="ml-2">
                    {#each groups as group, index}
                        <NomenclatureGroupLabel {group} on:click={() => groups = groups.filter((g, i) => i !== index)}></NomenclatureGroupLabel>
                    {/each}
                </Flex>
            {/if}
        </svelte:fragment>
        <Flex gap={2} class="mr-2">
            <button>
                <Icon src={Check}  class="h-6 w-6 text-emerald-500 hover:text-emerald-500/75 duration-300"/>
            </button>
        </Flex>
    </Input>
</Flex>

{#if validateOnChange}
    <button class="invisible" bind:this={validateButton} />
{/if}
