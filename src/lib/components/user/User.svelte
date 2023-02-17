<script lang="ts">
    import type { UsersResponse } from "$lib/DBTypes";
    export let user: UsersResponse;
</script>

<div>
    <span class="text-sm font-medium block">{user.username}</span>
    <span class="text-sm block">{user.email}</span>
</div>