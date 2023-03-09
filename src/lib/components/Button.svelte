<script lang="ts">

    export let size: "base" | "small" | "tiny" = "base";
    export let role: "primary" | "secondary" | "tertiary" | "danger" | "warning" | "success" = "primary"

    export let textColor = "hover:text-white text-zinc-800";
    export let hoverColor = "hover:bg-violet-500";
    export let borderColor = "border-violet-500";
    
    const sizes: Record<typeof size, string> = {
        "base": "border-2 py-2 px-4 font-bold",
        "small": "border-2 py-1 px-2 font-semibold text-sm",
        "tiny": "border py-1 px-2 font-medium text-xs"
    }
    
    const roles: Record<typeof role, string> = {
        "primary": "hover:text-white text-zinc-800 hover:bg-violet-500 border-violet-500",
        "secondary": "hover:text-white text-zinc-800 hover:bg-blue-500 border-blue-500",
        "tertiary": "hover:text-white text-zinc-800 hover:bg-gray-500 border-gray-500",

        "warning": "hover:text-white text-zinc-800 hover:bg-amber-500 border-amber-500",
        "danger": "hover:text-white text-zinc-800 hover:bg-red-500 border-red-500",
        "success": "hover:text-white text-zinc-800 hover:bg-emerald-500 border-emerald-500"
    };

</script>

<button class="{sizes[size]} {roles[role]} duration-100 rounded-md {$$props.class}" on:click>
    <slot />
</button>