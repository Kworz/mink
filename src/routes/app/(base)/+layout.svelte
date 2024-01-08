<script lang="ts">
    
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import { CircleStack, ChevronLeft, UserCircle, Users, QrCode } from "@steeze-ui/heroicons";
    import Menu from "$lib/components/generics/menu/Menu.svelte";
    import MenuItem from "$lib/components/generics/menu/MenuItem.svelte";
    import MenuSeparator from "$lib/components/generics/menu/MenuSeparator.svelte";
    import { page } from "$app/stores";

</script>

<Flex gap={0} class="h-screen w-screen overflow-hidden">
    <Menu>
        {#if $page.route.id !== "/app/(base)"}
            <MenuItem icon={ChevronLeft} href="/app" label="Accueil" />
        {/if}

        <MenuSeparator class={$page.route.id === "/app/(base)" ? "mt-0" : ""}>Modules</MenuSeparator>
        <MenuItem icon={CircleStack} href="/app/scm/articles" label="Gestion logistique (SCM)" />
        <MenuItem icon={UserCircle} href="/app/crm/" label="Gestion base clients (CRM)" />

        <MenuSeparator>Outils</MenuSeparator>
        <MenuItem icon={QrCode} href="/app/scanner" label="Scanner QRCode" />

        <MenuSeparator>Gestion</MenuSeparator>
        <MenuItem icon={Users} href="/app/users" label="Utilisateurs" />
    </Menu>

    <div class="grow overflow-x-hidden overflow-y-scroll">
        <div class="relative w-full p-10 pl-6">
            <slot />
        </div>
    </div>

    <div class="h-screen" id="side_menu" />
</Flex>