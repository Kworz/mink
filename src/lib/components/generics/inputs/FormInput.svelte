<script lang="ts">

    import Flex from "$lib/components/generics/layout/flex.svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{
        blur: typeof value | typeof checked,
        change: typeof value | typeof checked
    }>();

    export let type: "number" | "text" | "password" | "email" | "file" | "select" | "date" | "checkbox" = "text";
    export let name: string;

    export let label: string | undefined = undefined;

    export let invalid = false;
    export let valid = false;

    export let value: string[] | string | number | null | undefined = "";
    export let checked: boolean | undefined = undefined;

    export let form: string | undefined = undefined;

    export let min: number | null | undefined = undefined;
    export let max: number | null | undefined = undefined;
    export let step: number | null | undefined = undefined;

    export let multiple: boolean = false;

    export let validateOnBlur = false;
    export let validateOnChange = false;

    export let backColors = "bg-gray-200 dark:bg-zinc-700";
    export let parentClass: string | undefined = undefined;

    export let autocomplete: string | undefined = undefined;
    export let required: boolean = false;
    
    const baseStyle = ""

    $: validateButton = validateOnBlur || validateOnChange;

    let exitButton: HTMLButtonElement | undefined = undefined;

    function typeAction(node: HTMLInputElement) {
        node.type = type;
    }

    function handleBlur()
    {
        if(validateOnBlur && exitButton)
            exitButton.click();
        dispatch("blur", type === "checkbox" ? checked : value);
    }

    function handleChange()
    {
        if(validateOnChange && exitButton)
            exitButton.click();
        dispatch("change", type === "checkbox" ? checked : value);
    }

    $: style = baseStyle + " " + backColors + " " + $$props.class;

</script>

<Flex gap={1} direction="col" class={parentClass}>
    {#if label && type !== "checkbox"}
        <span class="text-white text-xs leading-4 w-max pl-0.5 pr-1">
            {label}
            {#if required}
                <span class="text-red-500">*</span>
            {/if}
        </span>
    {/if}

    {#if type === "select"}
        {#if multiple} 
            <select {name} {form} bind:value class="{style}" {required} class:ring-emerald-500={valid} class:ring-red-500={invalid} class:ring-2={invalid || valid} multiple on:change={handleChange} on:blur={handleBlur}>
                <slot />
            </select>
        {:else}
            <select {name} {form} bind:value class="{style}" {required} class:ring-emerald-500={valid} class:ring-red-500={invalid} class:ring-2={invalid || valid} on:change={handleChange} on:blur={handleBlur}>
                <slot />
            </select>
        {/if}
    {:else if type === "checkbox"}
        <Flex items="center" gap={2} class="my-0.5">
            <input type="checkbox" {name} {form} bind:checked {min} {max} {step} {required} class="{style}" class:ring-emerald-500={valid} class:ring-red-500={invalid} class:ring-2={invalid || valid} on:change={handleChange} on:blur={handleBlur}/>
            <span>{label}</span>
        </Flex>
    {:else}
        <input use:typeAction {name} {form} bind:value {min} {max} {step} {autocomplete} {required} class="{style}" class:ring-emerald-500={valid} class:ring-red-500={invalid} class:ring-2={invalid || valid} on:change={handleChange} on:blur={handleBlur}/>
    {/if}

    {#if validateButton}
        <button class="hidden" bind:this={exitButton}></button>
    {/if}
    
</Flex>

<style lang="postcss">

    input, select {
        @apply ring-1 ring-zinc-400/25 bg-zinc-800 rounded-md p-2 transition-all;
    }

</style>