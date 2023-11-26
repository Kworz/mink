<script lang="ts">
    
    import Flex from "$lib/components/layout/flex.svelte";
    import { CircleStack, ChevronLeft, UserCircle, Users } from "@steeze-ui/heroicons";
    import Menu from "$lib/components/appLayout/Menu.svelte";
    import MenuItem from "$lib/components/appLayout/MenuItem.svelte";
    import MenuSeparator from "$lib/components/appLayout/MenuSeparator.svelte";
    import { page } from "$app/stores";

</script>

<Flex gap={0} class="h-screen w-screen overflow-hidden">
    <Menu>
        {#if $page.route.id !== "/app/(base)"}
            <MenuItem icon={ChevronLeft} href="/app" label="Accueil" />
        {/if}

        <MenuSeparator>Outils</MenuSeparator>
        <MenuItem icon={CircleStack} href="/app/scm/" label="Gestion logistique (SCM)" />
        <MenuItem icon={UserCircle} href="/app/crm/" label="Gestion base clients (CRM)" />

        <MenuSeparator>Gestion</MenuSeparator>
        <MenuItem icon={Users} href="/app/users" label="Utilisateurs" />

    </Menu>

    <div class="grow overflow-x-hidden overflow-y-scroll">
        <div class="w-full p-4 pl-2">
            <slot />
        </div>
    </div>

    <div class="h-screen" id="side_menu" />
</Flex>