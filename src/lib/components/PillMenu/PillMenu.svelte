<script lang="ts">
    import { EllipsisHorizontal } from "@steeze-ui/heroicons";
    import { scale } from "svelte/transition";
    import RoundButton from "../RoundButton.svelte";

    export let open = false;
</script>

<div class="absolute top-4 right-4">
    <div class="relative z-50 flex flex-col items-end gap-2">
        <RoundButton icon={EllipsisHorizontal} on:click={() => open = !open}/>
        {#if open}
            <div class="bg-gray-200 dark:bg-zinc-700 rounded-md p-4 flex flex-col items-start gap-3 w-max" in:scale={{ duration: 100 }} out:scale={{ duration:100 }}>
                <slot />
            </div>
        {/if}
    </div>
</div>
