<script lang="ts">
    
    import Flex from "$lib/components/layout/flex.svelte";
    import { CircleStack, Calendar, DocumentText, ClipboardDocumentCheck, Wrench, Truck, DocumentChartBar, QueueList, QrCode, PuzzlePiece, ChevronLeft, UserCircle, Users } from "@steeze-ui/heroicons";
    import Menu from "$lib/components/appLayout/Menu.svelte";
    import MenuItem from "$lib/components/appLayout/MenuItem.svelte";
    import TopBar from "$lib/components/appLayout/TopBar.svelte";
    import MenuSeparator from "$lib/components/appLayout/MenuSeparator.svelte";
    import MenuCloseButton from "$lib/components/appLayout/MenuCloseButton.svelte";

</script>

<Flex gap={0} class="h-screen w-screen overflow-hidden">
    <Menu>
        <MenuCloseButton />

        <MenuSeparator>Outils</MenuSeparator>
        <MenuItem icon={CircleStack} href="/app/scm/" label="SCM - Gestion logistique" />
        <MenuItem icon={UserCircle} href="/app/crm/" label="CRM" />

        <MenuSeparator>Gestion</MenuSeparator>
        <MenuItem icon={Users} href="/app/users" label="Utilisateurs" />

        <MenuSeparator>Réglages</MenuSeparator>
        <MenuItem icon={Wrench} href="/app/settings" label="Réglages" />
    </Menu>

    <div class="grow overflow-x-hidden overflow-y-scroll">
        <div class="w-full p-6">
            <slot />
        </div>
    </div>

    <div class="h-screen" id="side_menu" />
</Flex>