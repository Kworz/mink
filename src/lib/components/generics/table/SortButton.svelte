<script lang="ts">
    import { Bars2, ChevronDown, ChevronUp } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { createEventDispatcher } from "svelte";

    export let colname: string;

    let direction: "none" | "asc" | "desc" = "none";

    const dispatch = createEventDispatcher<{
        sort: { colname: string, direction: "none" | "asc" | "desc" },
    }>();

    const sort = () => {

        if(direction === "none")
            direction = "asc";
        else if(direction === "asc")
            direction = "desc";
        else
            direction = "none";

        dispatch("sort", { colname, direction });

    }

</script>

<button on:click={sort}>
    <Icon src={direction !== "none" ? ((direction === "asc") ? ChevronUp : ChevronDown) : Bars2} class="h-4 w-4 font-bold text-violet-400" theme="solid" />
</button>