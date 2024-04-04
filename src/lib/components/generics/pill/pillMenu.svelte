<script lang="ts">
    import RoundButton from "$lib/components/generics/RoundButton.svelte";
    import { clickOutside, setPillMenuContext } from "$lib/components/generics/pill/pillMenu";
    import { EllipsisHorizontal } from "@steeze-ui/heroicons";
    import { fade, scale } from "svelte/transition";

    const { open } = setPillMenuContext();

    export let message: string | undefined = undefined;
    export let selection: number | undefined = undefined;
</script>

<div class="absolute top-10 right-10 flex flex-col items-end gap-4">
    <div class="flex flex-row gap-4">
        {#if message}
            <span in:fade={{ duration: 100 }} out:fade={{ duration: 100 }} class="inline-block text-sm text-zinc-200">{message}</span>
        {/if}
        <RoundButton icon={EllipsisHorizontal} on:click={() => $open = !$open} />
    </div>

    {#if $open}
        <div class="bg-zinc-700 ring-1 ring-zinc-400/50 z-50 rounded-md p-4 flex flex-col items-start gap-3 w-max" in:scale={{ duration: 100 }} out:scale={{ duration:100 }} use:clickOutside on:click_outside={() => { if($open === true) { $open = false } }}>
            <slot />
            {#if selection !== undefined && selection > 0}
                <div class="flex gap-2 w-full items-center">
                    <span class="text-sm">Sélection</span>
                    <div class="grow bg-zinc-400/50 w-auto h-[1px]" />
                </div>
                <slot name="selection" />
            {/if}
        </div>
    {/if}
</div>
