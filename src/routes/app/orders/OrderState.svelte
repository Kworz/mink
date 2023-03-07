<script lang="ts">

    import Flex from "$lib/components/layout/flex.svelte";
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

</script>

<Flex gap={2} items="center">
    <span>{names[state]}</span>
    <Icon src={icons[state]} class="h-4 w-4 text-violet-500" />
</Flex>