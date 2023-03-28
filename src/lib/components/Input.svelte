<script lang="ts">

    export let value: string;
    export let placeholder: string | undefined = undefined;

</script>

<div class="border bg-gray-200 dark:bg-zinc-700 dark:border-zinc-800/50 rounded-md flex flex-row gap-2 items-center duration-100 relative {$$props.class}">
    <slot name="before" />
    <input bind:value {placeholder} class="p-2 bg-transparent grow" on:keyup on:keydown />
    <slot />
</div>
