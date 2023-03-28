<script lang="ts">
    import { MagnifyingGlass } from "@steeze-ui/heroicons";

    
    import { Icon } from "@steeze-ui/svelte-icon";
import Input from "../Input.svelte";

    let searchTerm = "";

</script>

<Input bind:value={searchTerm} placeholder="Recherche" class="grow sm:max-w-[80%] md:max-w-[50%] lg:max-w-[33%">
    <Icon src={MagnifyingGlass} class="h-4 w-4 mr-4" />
</Input>
