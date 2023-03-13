<script lang="ts">

    import { EllipsisHorizontal } from "@steeze-ui/heroicons";
    import { scale, fade } from "svelte/transition";
    import RoundButton from "../RoundButton.svelte";

    export let open = false;

</script>

<div class="absolute top-4 right-4">
    <RoundButton icon={EllipsisHorizontal} on:click={() => open = !open} class={open ? "z-50" : ""}/>
    {#if open}
        <div class="fixed inset-0 backdrop-blur-lg z-40" in:fade={{ duration: 100 }} out:fade={{ duration:100 }}/>
        <div class="bg-gray-200 rounded-md top-[calc(100%+1rem)] right-0 absolute p-4 flex flex-col items-start gap-3 w-max" in:scale={{ duration: 100 }} class:z-50={open} out:scale={{ duration:100 }}>
            <slot />
        </div>
    {/if}
</div>
