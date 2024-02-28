<script lang="ts">
    import type { PageData, ActionData } from "./$types";

    import { page } from "$app/stores";
    import { invalidateAll } from "$app/navigation";
    import { enhanceNoReset } from "$lib/enhanceNoReset"; 
    import { _ } from "svelte-i18n";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";

    export let form: ActionData;

    $: if(form !== null) { invalidateAll(); }

</script>

<h1>Profil de {$page.data.user?.username}</h1>
<p>Modifiez votre profil ici</p>

<h2>Réglages personel de mink</h2>

<div class="grid grid-cols-2 gap-4 mt-6">
    {#each Object.entries($page.data.userSettings ?? []) as [key, value]}
        <form action="?/updateUserSettings" method="post" use:enhanceNoReset>
            <input name="key" value={key} type="hidden" />
            {#if typeof value === "boolean"}
                <input name="checkbox" type="hidden" value="true" />
                <FormInput name="value" checked={value} label={key} type="checkbox" validateOnChange />
            {:else}
                <FormInput name="value" value={value} label={$_("app.settings.keys." + key)} type={(typeof value === "string") ? "text" : "number"} validateOnBlur />
            {/if}

        </form>
    {/each}
</div>