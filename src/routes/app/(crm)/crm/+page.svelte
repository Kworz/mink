<script>
    import HomeMenuGrid from "$lib/components/HomeMenuGrid.svelte";
    import HomeMenuItem from "$lib/components/HomeMenuItem.svelte";
    import { ListBullet, Sparkles, UserGroup } from "@steeze-ui/heroicons";
</script>

<h1>Customer Relations Manager</h1>
<p class="mb-6">Gestionaire de relations client.</p>

<HomeMenuGrid>

    <HomeMenuItem icon={ListBullet} href="/app/crm/leads" title="Leads" />
    <HomeMenuItem icon={UserGroup} href="/app/crm/companies" title="Sociétés & Contacts" />
    <HomeMenuItem icon={Sparkles} href="/app/crm/interests" title="Interets" />

</HomeMenuGrid>