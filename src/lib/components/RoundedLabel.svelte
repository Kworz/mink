<script lang="ts">

    export let size: "sm" | "md" | "lg" = "md";
    export let role: "primary" | "secondary" | "success" | "danger" | "warning" | "info" = "primary";

    const sizes = {
        sm: "py-1 px-2 text-xs",
        md: "py-1 px-3 text-sm",
        lg: "py-2 px-4 text-base",
    };

    const roles = {
        primary: "bg-violet-400/75 text-white ring-1 ring-violet-700/75",
        secondary: "bg-gray-200/75 text-gray-700 ring-1 ring-gray-700/50",
        success: "bg-emerald-400/75 text-white ring-1 ring-emerald-700/75",
        danger: "bg-red-400/75 text-white ring-1 ring-red-700/75",
        warning: "bg-yellow-400/75 text-white ring-1 ring-yellow-700/75",
        info: "bg-blue-400/75 text-white ring-1 ring-blue-700/75",
    };

</script>

<span class="{sizes[size]} {roles[role]} rounded-full whitespace-nowrap font-semibold inline-block {$$props.class}">
    <slot />
</span>