<script lang="ts">
    import { EllipsisHorizontal } from "@steeze-ui/heroicons";
    import { fade, scale } from "svelte/transition";
    import RoundButton from "../RoundButton.svelte";
    import { clickOutside, setPillMenuContext } from "./PillMenu";

    const { open } = setPillMenuContext();

    export let message: string | undefined = undefined;

</script>

<div class="absolute top-10 right-10 flex flex-row items-center gap-4">
    {#if message}
        <span in:fade={{ duration: 100 }} out:fade={{ duration: 100 }} class="inline-block text-sm text-zinc-200">{message}</span>
    {/if}

    <div class="relative z-50 flex flex-col items-end gap-2" use:clickOutside on:click_outside={() => { if($open === true) { $open = false } }}>
        <RoundButton icon={EllipsisHorizontal} on:click={() => $open = !$open}>actions</RoundButton>
        {#if $open}
            <div class="bg-zinc-700 rounded-md p-4 flex flex-col items-start gap-3 w-max" in:scale={{ duration: 100 }} out:scale={{ duration:100 }}>
                <slot />
            </div>
        {/if}
    </div>
</div>
