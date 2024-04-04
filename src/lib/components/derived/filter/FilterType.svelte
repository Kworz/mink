<script lang="ts">
    import { _ } from "svelte-i18n";
    import type { PrismaFilterType } from "./filter";

    export let filterType: PrismaFilterType;

</script>

<div class="text-xs rounded-full text-violet-500 bg-zinc-300 py-0.5 px-2">
    {$_('app.filter.' + filterType.toLowerCase())}
</div>