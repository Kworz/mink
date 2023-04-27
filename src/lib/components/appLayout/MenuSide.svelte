<script lang="ts">

    import { Bars3, XMark } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import Portal from "svelte-portal";
    import { menuRightShrinked } from "./menuContext";

    export let closable = false;

</script>

<Portal target="#side_menu">
    <div class="h-screen shrink-0 bg-white dark:bg-zinc-800 shadow-2xl duration-300 {$menuRightShrinked ? "p-4" : "py-6 px-8"} w-max">

        {#if closable}
            <button on:click={() => $menuRightShrinked = !$menuRightShrinked}>
                <h3 class="text-red-500">
                    <Icon src={XMark} class="h-6 w-6" />
                    Fermer le menu
                </h3>
            </button>
        {/if}
        
        <div class="{!$menuRightShrinked ? "w-max" : "w-0 overflow-clip"} duration-300">
            <slot />
        </div>
    </div>
</Portal>