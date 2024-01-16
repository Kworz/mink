<script lang="ts">

    export let value: string;
    export let placeholder: string | undefined = undefined;

    export let input: HTMLInputElement | undefined = undefined;
    export let invalid = false;

</script>

<div 
    class="ring-1 bg-zinc-800 ring-zinc-400/25 rounded-md flex flex-row gap-2 items-center duration-100 relative {$$props.class} focus-within:ring-2 focus-within:ring-violet-500/75 duration-150"
    class:!ring-2={invalid}
    class:!ring-red-500={invalid}
>
    <slot name="before" />
    <input bind:this={input} bind:value {placeholder} class="p-2 bg-transparent grow" on:keyup on:keydown />
    <slot />
</div>