<script lang="ts">
    import { QuestionMarkCircle, type IconSource } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import Wrapper from "./Wrapper.svelte";
    import Flex from "./layout/flex.svelte";

    export let title: string;
    export let description: string = "";
    export let href: string = "#";
    export let icon: IconSource = QuestionMarkCircle;
</script>

<a {href}>
    <Wrapper>
        <Flex items="start">
            <Icon src={icon} class="w-8 h-8" />
            <section>
                <h3>{title}</h3>
                <p class="font-normal text-zinc-500">{description}</p>
            </section>
        </Flex>
    </Wrapper>
</a>