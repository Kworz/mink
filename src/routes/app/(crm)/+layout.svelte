<script lang="ts">
    
    import { CircleStack, Calendar, DocumentText, ClipboardDocumentCheck, Wrench, Truck, DocumentChartBar, QueueList, PuzzlePiece, ChevronLeft, ListBullet, UserGroup, Sparkles } from "@steeze-ui/heroicons";
    import Flex from "$lib/components/layout/flex.svelte";
    import Menu from "$lib/components/appLayout/Menu.svelte";
    import MenuItem from "$lib/components/appLayout/MenuItem.svelte";
    import TopBar from "$lib/components/appLayout/TopBar.svelte";
    import MenuSeparator from "$lib/components/appLayout/MenuSeparator.svelte";
    import MenuCloseButton from "$lib/components/appLayout/MenuCloseButton.svelte";

</script>

<Flex gap={0} class="h-screen w-screen overflow-hidden">
    <Menu>
        <MenuItem icon={ChevronLeft} href="/app" label="Accueil" />
        <MenuCloseButton />

        <MenuSeparator></MenuSeparator>
        <MenuItem icon={ListBullet} href="/app/crm/leads" label="Leads" />
        <MenuItem icon={UserGroup} href="/app/crm/companies" label="Sociétés & Contacts" />
        <MenuItem icon={Sparkles} href="/app/crm/interests" label="Interets" />

    </Menu>

    <div class="grow overflow-x-hidden overflow-y-scroll">
        <TopBar />
        <div class="w-full p-6" id="main_content">
            <slot />
        </div>
    </div>

    <div class="h-screen" id="side_menu" />
</Flex>