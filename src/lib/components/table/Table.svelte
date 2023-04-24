<script lang="ts">

    export let marginTop = "mt-6";
    export let backgroundColor = "bg-white dark:bg-zinc-800";

    export let embeded = false;

</script>

<table class="table-auto w-full {embeded ? "" : "p-4 rounded-lg drop-shadow-sm"} {marginTop} {backgroundColor} {$$props.class}">
    <thead>
        <tr>
            <slot name="head" />
        </tr>
    </thead>

    <tbody>
        <slot name="body" />
    </tbody>

    <tfoot class="border-t border-t-violet-500 font-semibold">
        <slot name="foot" />
    </tfoot>
</table>
