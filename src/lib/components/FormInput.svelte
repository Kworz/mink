<script lang="ts">
    import Flex from "./layout/flex.svelte";

    export let type: "number" | "text" | "password" | "email" | "file" = "text";
    export let name: string;

    export let label: string | undefined = undefined;
    export let labelMandatory = false;

    export let invalid = false;

    export let value: string | number = "";

    export let min: number | null | undefined = undefined;
    export let max: number | null | undefined = undefined;

    export let backgroundColor = "bg-zinc-100";

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
    
    <input {type} {name} {value} {min} {max} class="border border-zinc-500/50 p-2 rounded-sm duration-200 {backgroundColor}" class:ring-red-500={invalid} on:change/>
</Flex>
