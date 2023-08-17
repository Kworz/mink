<script lang="ts">
    import { page } from "$app/stores";

    import type { IconSource } from "@steeze-ui/heroicons/types";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { getMenuContext } from "./menuContext";
    import { fade } from "svelte/transition";
    
    export let icon: IconSource;
    export let href: string;
    export let label: string;

    const { isShrinked } = getMenuContext();

    $: active = $page.url.pathname.includes(href) && href !== "/app";

</script>

<a {href}>
    <div 
        class="flex gap-2 rounded-md {$isShrinked ? "p-2" : "py-2 px-4"} items-center duration-200 font-medium {active ? "bg-violet-500 hover:bg-violet-500/90 text-white" : "hover:bg-violet-200 hover:text-violet-700 dark:text-zinc-800 text-white"}"
    >
        <Icon src={icon} class="h-4 w-4" />
        {#if !$isShrinked}
            <span in:fade={{ duration: 200 }} out:fade={{ duration: 50 }}>{label}</span>
        {/if}
    </div>
</a>