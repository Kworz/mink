<script lang="ts">
    import { enhance } from "$app/forms";
    import FormInput from "$lib/components/FormInput.svelte";

    import Wrapper from "$lib/components/Wrapper.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import type { ActionData, PageData } from "./$types";

    export let data: PageData;
    export let form: ActionData;

</script>


<Wrapper>
    <h1>Réglages de l'application</h1>

    <div class="grid grid-cols-1 gap-4 mt-12">

        {#each Object.keys(data.settings) as key}
            {@const value = data.settings[key]}
            <form action="?/updateSetting" method="post" use:enhanceNoReset>
            
                <input name="key" value={key} type="hidden" />
                <FormInput name="value" {value} label={key} type="text" validateOnBlur />
            
            </form>
        {/each}



    </div>

</Wrapper>