<script lang="ts">
    
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import { CircleStack, ChevronLeft, UserCircle, Users, QrCode, ChevronRight, Banknotes, DocumentChartBar } from "@steeze-ui/heroicons";
    import Menu from "$lib/components/generics/menu/Menu.svelte";
    import MenuItem from "$lib/components/generics/menu/MenuItem.svelte";
    import MenuSeparator from "$lib/components/generics/menu/MenuSeparator.svelte";
    import { page } from "$app/stores";
    import { _ } from "svelte-i18n";

</script>

<Flex gap={0} class="h-screen w-screen overflow-hidden" direction={$page.data.userSettings?.app_menu_left === false ? "rowReverse" : "row"}>
    <Menu>
        {#if $page.route.id !== "/app/(base)"}
            <MenuItem icon={$page.data.userSettings?.app_menu_left ? ChevronLeft : ChevronRight} href="/app" label="Accueil" />
        {/if}

        <MenuSeparator class={$page.route.id === "/app/(base)" ? "mt-0" : ""}>Utilisateurs</MenuSeparator>
        <MenuItem icon={CircleStack} href="/app/settings/users/" label={$_('app.generic.users')} />
        <MenuItem icon={UserCircle} href="/app/settings/users_groups" label={$_('app.generic.users_groups')} />

        <MenuSeparator>Général</MenuSeparator>
        <MenuItem icon={QrCode} href="/app/settings/mink" label="Réglages de mink" />
        <MenuItem icon={DocumentChartBar} href="/app/settings/stats" label="Données de déboguage" />
    </Menu>

    <div class="grow overflow-x-hidden overflow-y-scroll" id="main_content">
        <div class="relative w-full p-10 pl-6">
            <slot />
        </div>
    </div>
</Flex>