<script lang="ts">
    
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import Menu from "$lib/components/generics/menu/Menu.svelte";
    import MenuItem from "$lib/components/generics/menu/MenuItem.svelte";
    import MenuSeparator from "$lib/components/generics/menu/MenuGroup.svelte";
    import { ChevronLeft, ChevronRight, CircleStack, Truck } from "@steeze-ui/heroicons";
    
    import type { LayoutData } from "./$types";
    import { _ } from "svelte-i18n";
    import { validatePermission } from "$lib/permission";

    export let data: LayoutData;

</script>

<Flex gap={0} class="h-screen w-screen overflow-hidden" direction={data.userSettings?.app_menu_left === false ? "rowReverse" : "row"}>
    <Menu>
        <MenuItem icon={data.userSettings?.app_menu_left ? ChevronLeft : ChevronRight} href="/app" label={$_('app.generic.home')} />

        <MenuSeparator items={[
            !validatePermission(data.user, "project", "r") ? undefined : { icon: CircleStack, href: "/app/pm/projects", label: $_('app.generic.projects') },
            !validatePermission(data.user, "manufacturing_order", "r") ? undefined : { icon: Truck, href: "/app/pm/manufacturing_orders", label: $_('app.generic.manufacturing_orders') },
        ]}>{$_('app.generic.project_manager')}</MenuSeparator>
    </Menu>

    <div class="relative grow overflow-x-hidden overflow-y-scroll p-10 pl-6" id="main_content">
        <slot />
    </div>
</Flex>