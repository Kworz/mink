<script lang="ts">
    import { page } from "$app/stores";
    import HomeMenuGrid from "$lib/components/HomeMenuGrid.svelte";
    import HomeMenuItem from "$lib/components/HomeMenuItem.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Grid from "$lib/components/layout/grid.svelte";
    import { QrCode, Truck, User, UserGroup, Wrench } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
</script>

<Wrapper>

    <h1>Accueil</h1>
    <p>Bienvenue, {$page.data.user?.username}. Choisissez l'application nomenclaturize que vous souhaitez utiliser</p>

</Wrapper>

<HomeMenuGrid>
    <HomeMenuItem icon={QrCode} title="Scanner QRCode" description="Scannez les QRCodes générés par nomenclaturize." href="/app/scanner" />
    <HomeMenuItem icon={Truck} title="SCM" description="Outil de gestion de la chaine logistique" href="/app/scm" />
    <HomeMenuItem icon={User} title="CRM" description="Outil de gestion des relations avec la clientèle." href="/app/crm" />
    <HomeMenuItem icon={UserGroup} title="Utilisateurs" description="Gestion des utilisateurs" href="/app/users" />
    <HomeMenuItem icon={Wrench} title="Réglages" description="Réglages de l'application" href="/app/settings" />
</HomeMenuGrid>
