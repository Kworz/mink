<script lang="ts">

    export let value: string;
    export let placeholder: string | undefined = undefined;

</script>

<div class="border bg-gray-200 rounded-md flex flex-row gap-2 items-center duration-100 relative">
    <slot name="before" />
    <input bind:value {placeholder} class="p-2 bg-transparent grow" on:keyup on:keydown />
    <slot />
</div>
