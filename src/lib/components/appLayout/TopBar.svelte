<script lang="ts">

    import { page } from "$app/stores";
    import { Bars3 } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import Flex from "../layout/flex.svelte";
    import Search from "../search/Search.svelte";
    import User from "../user/User.svelte";
    import { menuShrinked } from "./menuContext";

</script>

<div class="bg-white dark:bg-zinc-800 p-4 sticky drop-shadow-lg border-l border-l-zinc-300/25">
    <Flex items="center" justify="between">

        <button class="flex gap-4 items-center md:hidden" on:click={() => $menuShrinked = !$menuShrinked}>
            <Icon src={Bars3} class="h-6 w-6" />
        </button>

        <Search />

        <User user={$page.data.user} />
    </Flex>
</div>