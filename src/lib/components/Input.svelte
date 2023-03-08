<script lang="ts">

    export let value: string;
    export let placeholder: string | undefined = undefined;

    export let borderColor = "border-zinc-500/50";

</script>

<div class="border bg-zinc-100 {borderColor} rounded-sm flex flex-row gap-2 items-center duration-100 relative">
    <slot name="before" />
    <input bind:value {placeholder} class="p-2 bg-transparent grow" on:keyup on:keydown />
    <slot />
</div>
