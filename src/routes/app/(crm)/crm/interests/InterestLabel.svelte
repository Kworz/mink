<script lang="ts">
    
    import type { CrmInterestResponse } from "$lib/DBTypes";
    export let interest: CrmInterestResponse;

</script>

<span class="py-1 px-3 text-white font-medium {interest.color} rounded-full">{interest.name}</span>