<script lang="ts">

    import { XMark } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import Portal from "svelte-portal";

    import { createEventDispatcher, onDestroy, onMount } from "svelte";

    const dispatch = createEventDispatcher();

    export let closable = false;
    export let noBlur = false;

    onMount(() => {
        if(!noBlur)
            document.getElementById("main_content")!.style.filter = "blur(1px)grayscale(1)";
    });

    onDestroy(() => {
        if(!noBlur)
            document.getElementById("main_content")!.style.filter = "";
    })

</script>

<Portal target="#side_menu">
    <div class="m-4 h-[calc(100vh-2rem)] rounded-xl shrink-0 bg-white dark:bg-zinc-800 shadow-2xl duration-300 p-4 w-max">

        {#if closable}
            <button on:click={() => { dispatch('close'); }} class="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 duration-200 rounded-md">
                <span class="text-red-500">
                    <Icon src={XMark} class="h-4 w-4 inline-block" />
                    Fermer le menu
                </span>
            </button>
        {/if}
        
        <div class="mt-8 w-max duration-300">
            <slot />
        </div>
    </div>
</Portal>