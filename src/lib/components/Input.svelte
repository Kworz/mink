<script lang="ts">

    export let value: string;
    export let placeholder: string | undefined = undefined;

</script>

<div class="border bg-zinc-100 border-zinc-500/50 rounded-sm flex flex-row gap-2 items-center">
    <input bind:value {placeholder} type="text" class="p-2 bg-transparent w-[33vw]" />
    <slot />
</div>
