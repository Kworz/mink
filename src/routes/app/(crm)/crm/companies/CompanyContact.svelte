<script lang="ts">
    import type { CrmCompanyContactResponse } from "$lib/DBTypes";


    export let contact: CrmCompanyContactResponse;

</script>

<a href="/app/crm/companies/{contact.company}" class="py-1 px-3 text-sm text-white bg-zinc-700 ring-1 ring-zinc-500/25 rounded-full inline hover:text-white/75">
    {contact.name}
</a>