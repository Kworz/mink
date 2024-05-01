<!-- TODO: This page must be refactored -->

<script lang="ts">

    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";

    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { _ } from "svelte-i18n";
    import type { PageData } from "../$types";

    export let data: PageData;

</script>

<h1>{$_('app.settings.lead')}</h1>
<p>{$_('app.settings.description')}</p>

<div class="grid grid-cols-2 gap-4 mt-6">
    {#each Object.entries(data.settings).filter(k => k[0] !== "app_configured") as [key, value]}
        <form action="?/updateSetting" method="post" use:enhanceNoReset>
            <input name="key" value={key} type="hidden" />

            {#if typeof value === "boolean"}
                <FormInput name="value" check={value} checked={value} label={key} type="checkbox" validateOnBlur />
            {:else}
                <FormInput name="value" value={value} label={$_("app.settings.keys." + key)} type={(typeof value === "string") ? "text" : "number"} validateOnBlur />
            {/if}

        </form>
    {/each}
</div>