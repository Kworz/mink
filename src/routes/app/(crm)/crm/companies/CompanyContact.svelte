<script lang="ts">
    import type { crm_company_contact } from "@prisma/client";

    export let contact: crm_company_contact;

</script>

<a href="/app/crm/companies/{contact.company_id}" class="py-1 px-3 text-sm text-white bg-zinc-700 ring-1 ring-zinc-500/25 rounded-full inline hover:text-white/75">
    {contact.name}
</a>