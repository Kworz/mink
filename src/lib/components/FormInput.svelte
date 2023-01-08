<script lang="ts">
    import Flex from "./layout/flex.svelte";

    export let type: "number" | "text" | "password" | "email" = "text";
    export let name: string;

    export let label: string | undefined = undefined;
    export let labelMandatory = false;

    export let invalid = false;

    export let value: string | number = "";

    export let min: number | null | undefined = undefined;
    export let max: number | null | undefined = undefined;

</script>

<Flex gap={1} direction="col" class={$$props.class}>
    {#if label}
        <span class="text-zinc-700 text-sm leading-4">
            {label}
            {#if labelMandatory}
                <span class="text-red-500">*</span>
            {/if}
        </span>
    {/if}
    
    <input {type} {name} {value} {min} {max} class="ring-2 ring-inset ring-zinc-500 p-2 rounded-md bg-transparent duration-200" class:ring-red-500={invalid}/>
</Flex>
