<script lang="ts">

    export let size: "base" | "small" | "tiny" = "base";

    export let textColor = "hover:text-white text-zinc-800";
    export let hoverColor = "hover:bg-violet-500";
    export let borderColor = "border-violet-500";

    const sizes: Record<typeof size, string> = {
        "base": "border-2 py-2 px-4 font-bold",
        "small": "border-2 py-1 px-2 font-semibold text-sm",
        "tiny": "border py-1 px-2 font-medium text-xs"
    }

</script>

<button class="{sizes[size]} {borderColor} {hoverColor} {textColor} duration-100 rounded-sm {$$props.class}" on:click>
    <slot />
</button>