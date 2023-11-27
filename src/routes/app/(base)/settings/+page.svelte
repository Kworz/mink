<script lang="ts">
    import FormInput from "$lib/components/FormInput.svelte";

    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import type { ActionData, PageData } from "./$types";

    export let data: PageData;
    export let form: ActionData;

</script>

<h1>Réglages de l'application</h1>

<div class="grid grid-cols-2 gap-4 mt-6">
    {#each Object.keys(data.settings).filter(k => k !== "appConfigured") as key}
        {@const value = data.settings[key]}
        <form action="?/updateSetting" method="post" use:enhanceNoReset>
        
            <input name="key" value={key} type="hidden" />
            <FormInput name="value" {value} label={key} type="text" validateOnBlur />
        
        </form>
    {/each}
</div>