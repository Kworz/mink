<script lang="ts">
    
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import { ChevronLeft, QrCode, ChevronRight } from "@steeze-ui/heroicons";
    import Menu from "$lib/components/generics/menu/Menu.svelte";
    import MenuItem from "$lib/components/generics/menu/MenuItem.svelte";

    import { page } from "$app/stores";
    import { _ } from "svelte-i18n";
    import type { LayoutData } from "./$types";

    export let data: LayoutData;

</script>

<Flex gap={0} class="h-screen w-screen overflow-hidden" direction={data.userSettings?.app_menu_left === false ? "rowReverse" : "row"}>
    <Menu>
        {#if $page.route.id !== "/app/(base)"}
            <MenuItem icon={data.userSettings?.app_menu_left ? ChevronLeft : ChevronRight} href="/app" label={$_('app.generic.home')} />
        {/if}

        <MenuItem icon={QrCode} href="/app/tools/qr_scanner" label="Scanner de QR Codes" />
    </Menu>

    <div class="grow overflow-x-hidden overflow-y-scroll" id="main_content">
        <div class="relative w-full p-10 pl-6">
            <slot />
        </div>
    </div>
</Flex>