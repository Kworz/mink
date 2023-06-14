<script lang="ts">
    
    import type { CrmInterestResponse } from "$lib/DBTypes";
    export let interest: CrmInterestResponse;

</script>

<span class="py-1 px-3 text-white font-medium {interest.color} rounded-full">{interest.name}</span>

<style>
    .background-rainbow {
        @apply bg-gradient-to-r from-red-500 via-yellow-500 to-green-500;
    }
</style>