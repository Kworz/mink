<script lang="ts">
    import Wrapper from "$lib/components/generics/containers/Wrapper.svelte";
    import { _ } from "svelte-i18n";
</script>

<svelte:head>
    <title>{$_('app.generic.accounting')} - mink</title>
</svelte:head>

<h1>{$_('app.generic.accounting')}</h1>
<p>{$_('app.accounting.description')}</p>

<div class="grid grid-cols-2 gap-6 mt-6">
    <Wrapper>
        <h2>Flux entrants</h2>
        <!-- Charts -->
    </Wrapper>
    <Wrapper>
        <h2>Flux sortants</h2>
        <!-- Charts -->
    </Wrapper>
</div>