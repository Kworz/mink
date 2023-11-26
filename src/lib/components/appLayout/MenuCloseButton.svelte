<script lang="ts">
    import { XMark } from "@steeze-ui/heroicons";

    import { Icon } from "@steeze-ui/svelte-icon";
    import { getMenuContext } from "./menuContext";

    const { isShrinked } = getMenuContext();

</script>

{#if !$isShrinked}

<button 
    class="flex group-hover:md:hidden gap-2 rounded-md {$isShrinked ? "p-2" : "py-2 px-4"} items-center duration-200 font-medium hover:bg-red-200 hover:text-red-700 text-zinc-800 dark:text-white"
    on:click={() => $isShrinked = true}
>
    <Icon src={XMark} class="h-4 w-4" />
    <span>Fermer le menu</span>
</button>

{/if}