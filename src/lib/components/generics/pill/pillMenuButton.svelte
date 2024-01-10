<script lang="ts">

    import type { IconSource } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { getPillMenuContext } from "$lib/components/generics/pill/pillMenu";

    export let icon: IconSource;
    export let role: "primary" | "secondary" | "danger" | "warning" = "primary";

    export let href: string | undefined = undefined;
    export let click: (() => boolean | any) | undefined = undefined;

    const { open } = getPillMenuContext();

    const roles: Record<typeof role, string> = {
        "primary": "hover:text-violet-500",
        "secondary": "hover:text-blue-500",
        "danger": "hover:text-red-500",
        "warning": "hover:text-amber-500"
    };

    const handleClick = () => {
        if (click) {
            const shouldCloseMenu = click();

            if(shouldCloseMenu === false)
                return;
            
            $open = false;
        }
    }

</script>

{#if href === undefined}
    <button on:click={handleClick} class="{roles[role]} duration-100">
        <Icon src={icon} class="h-4 w-4 inline mr-2"/>
        <slot />
    </button>
{:else}
    <a {href} class="{roles[role]} duration-100">
        <Icon src={icon} class="h-4 w-4 inline mr-2" />
        <slot />
    </a>
{/if}
