<script lang="ts">
    import { ArrowPath, ExclamationTriangle } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";

    export let size: "base" | "small" | "tiny" = "base";
    export let role: "primary" | "secondary" | "tertiary" | "danger" | "warning" | "success" = "primary";
    
    export let form: string | undefined = undefined;
    export let preventSend = false;
    
    /** Applies only when `role=danger` */
    export let confirm = false;
    export let suspense = false;
    
    const sizes: Record<typeof size, string> = {
        "base": "border-2 py-2 px-4 font-bold",
        "small": "border-2 py-1 px-2 font-semibold text-sm",
        "tiny": "border py-1 px-2 font-medium text-xs"
    }
    
    const roles: Record<typeof role, string> = {
        "primary": "hover:bg-violet-500 border-violet-500",
        "secondary": "hover:bg-blue-500 border-blue-500",
        "tertiary": "hover:bg-gray-500 border-gray-500",

        "warning": "hover:bg-amber-500 border-amber-500",
        "danger": (!confirm) ? "hover:bg-red-500 border-red-500" : "hover:bg-red-600 border-red-600",
        "success": "hover:bg-emerald-500 border-emerald-500"
    };

</script>

<button {form} type={preventSend ? "button" : "submit"} class="flex flex-row gap-3 items-center text-white duration-100 rounded-md {sizes[size]} {roles[role]} {$$props.class}" on:click>
    {#if suspense} <Icon src={ArrowPath} class="animate-spin w-5 h-5 inline" /> {/if}
    {#if confirm && role === "danger"} <Icon src={ExclamationTriangle} class="w-5 h-5 inline" /> {/if}
    <div>
        <slot />
    </div>
</button>