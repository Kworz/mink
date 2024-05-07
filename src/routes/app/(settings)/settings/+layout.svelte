<script lang="ts">
    
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import { ChevronLeft, UserCircle, Users, ChevronRight, Server } from "@steeze-ui/heroicons";
    import Menu from "$lib/components/generics/menu/Menu.svelte";
    import MenuItem from "$lib/components/generics/menu/MenuItem.svelte";
    import MenuSeparator from "$lib/components/generics/menu/MenuGroup.svelte";
    import { page } from "$app/stores";
    import { _ } from "svelte-i18n";
    import { validatePermission } from "$lib/permission";

</script>

<Flex gap={0} class="h-screen w-screen overflow-hidden" direction={$page.data.userSettings?.app_menu_left === false ? "rowReverse" : "row"}>
    <Menu>
        {#if $page.route.id !== "/app/(base)"}
            <MenuItem icon={$page.data.userSettings?.app_menu_left ? ChevronLeft : ChevronRight} href="/app" label="Accueil" />
        {/if}

        <MenuSeparator class={$page.route.id === "/app/(base)" ? "mt-0" : ""} items={[
            !validatePermission($page.data.user, 'users', 'r') ? undefined : { icon: Users, href: "/app/settings/users", label: $_('app.generic.users') },
            !validatePermission($page.data.user, 'users_groups', 'r') ? undefined : { icon: UserCircle, href: "/app/settings/users_groups", label: $_('app.generic.users_groups') },
        ]}>{$_('app.generic.users')}</MenuSeparator>

        <MenuSeparator items={[
            $page.data.user?.group?.admin !== true ? undefined : { icon: Server, href: "/app/settings/mink", label: $_('app.settings.lead') }
        ]}>{$_('app.generic.generic')}</MenuSeparator>
    </Menu>

    <div class="grow overflow-x-hidden overflow-y-scroll" id="main_content">
        <div class="relative w-full p-10 pl-6">
            <slot />
        </div>
    </div>
</Flex>