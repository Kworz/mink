<script lang="ts">
    import Flex from "./layout/flex.svelte";

    export let type: "number" | "text" | "password" | "email" | "file" | "select" | "date" | "checkbox" = "text";
    export let name: string;

    export let label: string | undefined = undefined;
    export let labelMandatory = false;

    export let invalid = false;

    export let value: string[] | string | number = "";
    export let checked: boolean | undefined = undefined;

    export let form: string | undefined = undefined;

    export let min: number | null | undefined = undefined;
    export let max: number | null | undefined = undefined;
    export let step: number | null | undefined = undefined;

    export let validateOnBlur = false;
    export let validateOnChange = false;

    export let backColors = "bg-gray-200 dark:bg-zinc-700";
    
    const baseStyle = "border dark:border-zinc-800/50  rounded-md p-2 duration-100"

    $: validateButton = validateOnBlur || validateOnChange;

    let exitButton: HTMLButtonElement | undefined = undefined;

    function typeAction(node: HTMLInputElement) {
        node.type = type;
    }

    function onBlur() {
        if(validateOnBlur && exitButton)
            exitButton.click();
    }

    function onChange() {
        if(validateOnChange && exitButton)
            exitButton.click();
    }

    $: style = baseStyle + " " + backColors;

</script>

<Flex gap={1} direction="col">
    {#if label}
        <span class="text-zinc-700 dark:text-white text-sm leading-4">
            {label}
            {#if labelMandatory}
                <span class="text-red-500">*</span>
            {/if}
        </span>
    {/if}

    {#if type == "select"}
        {#if Array.isArray(value)} 
            <select {name} {form} bind:value class="{style}" class:ring-red-500={invalid} multiple on:change={onChange} on:blur={onBlur}>
                <slot />
            </select>
        {:else}
            <select {name} {form} bind:value class="{style}" class:ring-red-500={invalid} on:change={onChange} on:blur={onBlur}>
                <slot />
            </select>
        {/if}
    {:else if type == "checkbox"}
        <input type="checkbox" {name} {form} bind:checked {min} {max} {step} class="{style}" class:ring-red-500={invalid} on:change={onChange} on:blur={onBlur}/>
    {:else}
        <input use:typeAction {name} {form} bind:value {min} {max} {step} class="{style}" class:ring-red-500={invalid} on:change={onChange} on:blur={onBlur}/>
    {/if}

    {#if validateButton}
        <button class="invisible" bind:this={exitButton}></button>
    {/if}
    
</Flex>
