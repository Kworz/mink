<script lang="ts">

    import { page } from "$app/stores";
    import Flex from "../layout/flex.svelte";
    import Search from "../search/Search.svelte";
    import User from "../user/User.svelte";

</script>

<div class="bg-white dark:bg-zinc-800 px-6 py-4 sticky drop-shadow-lg border-x border-l-zinc-300/25">
    <Flex items="center" justify="between">

        <Search />

        <User user={$page.data.session?.user} />
    </Flex>
</div>