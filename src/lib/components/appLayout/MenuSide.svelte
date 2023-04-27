<script lang="ts">

    import { Bars3, XMark } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import Portal from "svelte-portal";
    import { menuRightShrinked } from "./menuContext";

    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let closable = false;

</script>

<Portal target="#side_menu">
    <div class="h-screen shrink-0 bg-white dark:bg-zinc-800 shadow-2xl duration-300 {$menuRightShrinked ? "p-4" : "py-6 px-8"} w-max">

        {#if closable}
            <button on:click={() => { dispatch('close'); $menuRightShrinked = !$menuRightShrinked; }} class="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 duration-200 rounded-md">
                <span class="text-red-500">
                    <Icon src={XMark} class="h-4 w-4 inline-block" />
                    Fermer le menu
                </span>
            </button>
        {/if}
        
        <div class="mt-8 {!$menuRightShrinked ? "w-max" : "w-0 overflow-clip"} duration-300">
            <slot />
        </div>
    </div>
</Portal>