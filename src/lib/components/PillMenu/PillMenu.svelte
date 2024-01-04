<script lang="ts">
    import { EllipsisHorizontal } from "@steeze-ui/heroicons";
    import { fade, scale } from "svelte/transition";
    import RoundButton from "../RoundButton.svelte";
    import { clickOutside, setPillMenuContext } from "./PillMenu";

    const { open } = setPillMenuContext();

    export let message: string | undefined = undefined;
</script>

<div class="absolute top-10 right-10 flex flex-col items-end gap-4">
    <div class="flex flex-row gap-4">
        {#if message}
            <span in:fade={{ duration: 100 }} out:fade={{ duration: 100 }} class="inline-block text-sm text-zinc-200">{message}</span>
        {/if}
        <RoundButton icon={EllipsisHorizontal} on:click={() => $open = !$open}>actions</RoundButton>
    </div>

    {#if $open}
        <div class="bg-zinc-700 ring-1 ring-zinc-400/50 z-50 rounded-md p-4 flex flex-col items-start gap-3 w-max" in:scale={{ duration: 100 }} out:scale={{ duration:100 }} use:clickOutside on:click_outside={() => { if($open === true) { $open = false } }}>
            <slot />
        </div>
    {/if}
</div>
