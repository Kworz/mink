<script lang="ts">
    import { XMark } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { createEventDispatcher } from "svelte";
    import Portal from "svelte-portal";
    import { fade } from "svelte/transition";
    export let title: string | undefined = undefined;
    export let closeButton = true;

    const dispatch = createEventDispatcher();

</script>

<Portal target="body">
    <div class="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50" in:fade={{ duration:100 }} out:fade={{ duration: 100 }}>

        <div class="p-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg ring-1 ring-zinc-500/5 min-w-[33%] max-h-[60%] overflow-y-scroll relative">
            {#if closeButton}
                <button class="absolute top-4 right-4" on:click={() => dispatch("close")}>
                    <Icon src={XMark} class="h-4 w-4 text-red-500" />
                </button>
            {/if}
            {#if title}
                <h3>Title</h3>
                <div class="mt-3 mb-4 h-[1px] w-2/3 bg-zinc-500/10" />
            {/if}
            <slot />
        </div>
    </div>
</Portal>