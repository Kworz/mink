<script lang="ts">
    import Flex from "./layout/flex.svelte";

    export let type: "number" | "text" | "password" | "email" | "file" | "select" | "date" = "text";
    export let name: string;

    export let label: string | undefined = undefined;
    export let labelMandatory = false;

    export let invalid = false;

    export let value: string | number = "";

    export let min: number | null | undefined = undefined;
    export let max: number | null | undefined = undefined;
    export let step: number | null | undefined = undefined;

    export let backgroundColor = "bg-zinc-100";

    export let validateOnBlur = false;
    export let validateOnChange = false;

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
        console.log("change event fired");
        if(validateOnChange && exitButton)
            exitButton.click();
    }

</script>

<Flex gap={1} direction="col">
    {#if label}
        <span class="text-zinc-700 text-sm leading-4">
            {label}
            {#if labelMandatory}
                <span class="text-red-500">*</span>
            {/if}
        </span>
    {/if}

    {#if type !== "select"}
        <input use:typeAction {name} bind:value {min} {max} {step} class="border border-zinc-500/50 p-2 rounded-sm duration-200 {backgroundColor}" class:ring-red-500={invalid} on:change={onChange} on:blur={onBlur}/>
    {:else}
        <select {name} bind:value class="border border-zinc-500/50 p-2 rounded-sm duration-200 {backgroundColor}" class:ring-red-500={invalid} on:change={onChange} on:blur={onBlur}>
            <slot />
        </select>
    {/if}

    {#if validateButton}
        <button class="invisible" bind:this={exitButton}></button>
    {/if}
    
</Flex>
