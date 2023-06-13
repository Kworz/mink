<script lang="ts">

    import RoundedLabel from "$lib/components/RoundedLabel.svelte";
    import type { OrdersStateOptions } from "$lib/DBTypes";
    import { ArchiveBoxXMark, Check, DocumentText, Envelope, EnvelopeOpen } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    export let state: OrdersStateOptions;

    let icons: Record<OrdersStateOptions, typeof DocumentText> = {
        "draft": DocumentText,
        "placed": Envelope,
        "acknowledged": EnvelopeOpen,
        "cancelled": ArchiveBoxXMark,
        "completed": Check
    };

    let names: Record<OrdersStateOptions, string> = {
        "draft": "Brouillon",
        "placed": "Envoyée",
        "acknowledged": "A/R recu",
        "completed": "Terminée",
        "cancelled": "Anullée"
    };

    let roleChoosen = {
        "draft": "secondary",
        "placed": "warning",
        "acknowledged": "info",
        "completed": "success",
        "cancelled": "warning"
    };

</script>

<RoundedLabel role={roleChoosen[state]}>
    {names[state]}
    <Icon src={icons[state]} class="h-4 w-4 ml-1 mb-1 inline" />
</RoundedLabel>