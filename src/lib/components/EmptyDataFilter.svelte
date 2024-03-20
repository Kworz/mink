<script>
    import Wrapper from "./generics/containers/Wrapper.svelte";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { DocumentMagnifyingGlass } from "@steeze-ui/heroicons";
    import { _ } from "svelte-i18n";
</script>

<Wrapper>
    <div class="flex flex-row gap-8 items-center">
        <Icon src={DocumentMagnifyingGlass} class="w-36 text-violet-500" theme="solid" />
        <div>
            <h2>{$_('app.empty-data-filter.title')}</h2>
            <p class="mb-4">{$_('app.empty-data-filter.description')}</p>
        </div>
    </div>
</Wrapper>
