<script lang="ts">

    import { Bars3 } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import Portal from "svelte-portal";
    import { menuRightShrinked } from "./menuContext";

</script>

<Portal target="#side_menu">
    <div class="h-screen shrink-0 bg-white dark:bg-zinc-800 shadow-2xl duration-300 {$menuRightShrinked ? "p-4" : "py-6 px-8"} w-max">
        <button on:click={() => $menuRightShrinked = !$menuRightShrinked}>
            <Icon src={Bars3} class="h-8 w-8" />
        </button>

        <div class="{!$menuRightShrinked ? "w-max" : "w-0 overflow-clip"} duration-300">
            <slot />
        </div>
    </div>
</Portal>