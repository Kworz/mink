<script lang="ts">
    import RoundedLabel, { type Roles } from "$lib/components/generics/RoundedLabel.svelte";
    import type { scm_order_state } from "@prisma/client";
    import { ArchiveBoxXMark, Check, DocumentMagnifyingGlass, DocumentText, Envelope, EnvelopeOpen } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { _ } from "svelte-i18n";
    
    export let state: scm_order_state;

    let icons: Record<scm_order_state, typeof DocumentText> = {
        "draft": DocumentText,
        "quotation": DocumentMagnifyingGlass,
        "sent": Envelope,
        "acknowledged": EnvelopeOpen,
        "cancelled": ArchiveBoxXMark,
        "completed": Check
    };

    const roleChoosen: Record<scm_order_state, Roles> = {
        "draft": "secondary",
        "quotation": "info",
        "sent": "warning",
        "acknowledged": "info",
        "completed": "success",
        "cancelled": "warning"
    };

</script>

<RoundedLabel role={roleChoosen[state]}>
    {$_('scm.orders.state.' + state)}
    <Icon src={icons[state]} class="h-4 w-4 ml-1 mb-1 inline" />
</RoundedLabel>