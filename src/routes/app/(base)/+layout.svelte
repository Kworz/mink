<script lang="ts">
    
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import { CircleStack, ChevronLeft, UserCircle, ChevronRight, Banknotes, WrenchScrewdriver } from "@steeze-ui/heroicons";
    import Menu from "$lib/components/generics/menu/Menu.svelte";
    import MenuItem from "$lib/components/generics/menu/MenuItem.svelte";
    import MenuSeparator from "$lib/components/generics/menu/MenuGroup.svelte";
    import { page } from "$app/stores";
    import { _ } from "svelte-i18n";
    import { validatePermission } from "$lib/permission";
    import type { LayoutData } from "./$types";

    export let data: LayoutData;

</script>

<Flex gap={0} class="h-screen w-screen overflow-hidden" direction={$page.data.userSettings?.app_menu_left === false ? "rowReverse" : "row"}>
    <Menu>
        {#if $page.route.id !== "/app/(base)"}
            <MenuItem icon={$page.data.userSettings?.app_menu_left ? ChevronLeft : ChevronRight} href="/app" label={$_('app.generic.home')} />
        {/if}

        <MenuSeparator class={$page.route.id === "/app/(base)" ? "mt-0" : ""} items={[
            !validatePermission(data.user, "article", "r") ? undefined : { icon: CircleStack, href: "/app/scm/articles", label: $_('app.generic.scm') },
            !validatePermission(data.user, "crm", "r") ? undefined : { icon: UserCircle, href: "/app/crm/", label: $_('app.generic.crm') },
            !validatePermission(data.user, "accounting", "r") ? undefined : { icon: Banknotes, href: "/app/accounting/", label: $_('app.generic.accounting') },
            !validatePermission(data.user, "pm", "r") ? undefined : { icon: CircleStack, href: "/app/pm/", label: $_('app.generic.project_manager')}
        ]}>{$_('app.generic.modules')}</MenuSeparator>

        <MenuSeparator items={[
            !validatePermission(data.user, "tools", "r") ? undefined : { icon: WrenchScrewdriver, href: "/app/tools", label: $_('app.generic.tools') },
        ]}>{$_('app.generic.others')}</MenuSeparator>
    </Menu>

    <div class="grow overflow-x-hidden overflow-y-scroll" id="main_content">
        <div class="relative w-full p-10 pl-6">
            <slot />
        </div>
    </div>
</Flex>