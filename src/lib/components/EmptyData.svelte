<script>
    import Button from "./generics/Button.svelte";
    import Wrapper from "./generics/containers/Wrapper.svelte";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { CubeTransparent } from "@steeze-ui/heroicons";
    import { _ } from "svelte-i18n";
</script>

<Wrapper class="mt-6">
    <div class="flex flex-row gap-8 items-center">
        <Icon src={CubeTransparent} class="w-36 text-violet-500" theme="solid" />
        <div>
            <h2>{$_('app.empty_data.title')}</h2>
            <p class="mb-4">{$_('app.empty_data.description')}</p>
            <Button on:click size="small" class="self-center">{$_('app.empty_data.action')}</Button>
        </div>
    </div>
</Wrapper>
