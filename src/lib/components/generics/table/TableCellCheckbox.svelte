<script lang="ts">
    import type { ChangeEventHandler } from "svelte/elements";
    import TableCell from "./TableCell.svelte";

    export let group: string[];
    export let value: string;

    /**
     * @description Function to handle the checkbox change event
     * @warning Using an onChange function to bypass https://github.com/sveltejs/svelte/issues/2308
     * @warning The previous implementation should work out of the box if this issue was solved.
    **/
    const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {

        if(e.target === null) return;

        const { value, checked } = e.target as any; // prevent ts to be angry because he dont know that the element is a checkbox input

        if(checked)
            group = [...group, value];
        else
            group = group.filter((item) => item !== value);

    } 
</script>

<TableCell class="items-center">
    <input type="checkbox" {value} checked={group.includes(value)} on:change={onChange} />
</TableCell>