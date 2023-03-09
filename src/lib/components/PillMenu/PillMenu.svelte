<script lang="ts">

    import { EllipsisHorizontal } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { scale } from "svelte/transition";
    import RoundButton from "../RoundButton.svelte";
    let open = false;

</script>

<div class="relative">
    <RoundButton icon={EllipsisHorizontal} on:click={() => open = !open} />
    {#if open}
        <div class="bg-gray-200 rounded-md top-[110%] right-0 absolute p-2 flex flex-col gap-2" in:scale out:scale>
            <slot />
        </div>
    {/if}
</div>
