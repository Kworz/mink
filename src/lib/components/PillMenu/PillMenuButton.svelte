<script lang="ts">

    import type { IconSource } from "@steeze-ui/heroicons/types";
    import { Icon } from "@steeze-ui/svelte-icon";

    export let icon: IconSource;
    export let role: "primary" | "secondary" | "danger" | "warning" = "primary";

    export let href: string | undefined = undefined;

    const roles: Record<typeof role, string> = {
        "primary": "hover:text-violet-500",
        "secondary": "hover:text-blue-500",
        "danger": "hover:text-red-500",
        "warning": "hover:text-amber-500"
    };

</script>

{#if href === undefined}
    <button on:click class="{roles[role]} duration-100">
        <Icon src={icon} class="h-4 w-4 inline mr-2"/>
        <slot />
    </button>
{:else}
    <a {href} class="{roles[role]} duration-100">
        <Icon src={icon} class="h-4 w-4 inline mr-2" />
        <slot />
    </a>
{/if}
