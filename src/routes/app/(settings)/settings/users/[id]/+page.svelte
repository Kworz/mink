<script lang="ts">

    import { _ } from "svelte-i18n";
    import type { PageData } from "./$types";
    export let data: PageData;

</script>

<svelte:head>
    <title>{data.user.username} — {$_('app.generic.user')} - mink</title>
</svelte:head>

<h1>{$_('app.generic.user')}: {data.user.username}</h1>
<p>{$_('app.generic.email_address')}: {data.user.email}</p>
<p>{$_('app.generic.user_group')} : {data.user.group?.name || '-'}</p>

<!-- TODO: Add all stuff affected by this user -->
