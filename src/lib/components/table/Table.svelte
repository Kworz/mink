<script lang="ts">

    export let marginTop = "mt-6";

</script>

<table class="table-auto w-full p-4 rounded-sm ring-1 ring-zinc-500/50 drop-shadow-lg {marginTop} bg-zinc-100 {$$props.class}">
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