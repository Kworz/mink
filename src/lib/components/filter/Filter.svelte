<script lang="ts">
    import { QuestionMarkCircle, XMark } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import Input from "../Input.svelte";
    import Flex from "../layout/flex.svelte";
    import { filterQuery, type FilterQueryResult } from "./filter";

    let filterHelp = false;
    
    export let filter: string = "";
    export let availableFilters: Array<string>;
    export let filterResult: FilterQueryResult<typeof availableFilters[number]>;

    $: filterResult = filterQuery(filter, availableFilters);
</script>

<div>
    {#if filterHelp}
        <div class="mb-4 p-4 bg-zinc-100 rounded-sm border border-zinc-500/50">
        
            <h4 class="leading-10">Filtres de recherche</h4>
        
            <p>Entrez le nom de l'élément recherché dans la zone de recherche. Vous pouvez aussi rechercher par fournisseur en utilisant le préfixe <em>supplier:Nom du founisseur</em>.</p>
            <p>Il est possible de combiner plusieurs filtres en délimitant les filtres avec <em>" && "</em>.</p>
            <p>Il est aussi possible d'utiliser un filtre plusieurs fois. ex: <em>supplier:x && supplier:y</em></p>
            <p>Vous pouvez aussi utiliser un point d'exclamation en guise de d'inversion du filtre<em>!</em>.</p>

            <span class="my-2 block">Les filtres suivants sont disponibles:</span>
            <ul style="list-style:disc; margin-left: 2rem;">
                {#each availableFilters as f}
                    <li>{f}:[valeur]</li>
                {/each}
            </ul>
        </div>
    {/if}

    <Flex>
        <Input bind:value={filter} placeholder={"Filtre"}>
            <Flex gap={2} class="mr-2">
                <button on:click={() => filter = ""}>
                    <Icon src={XMark}  class="h-6 w-6 text-red-500 hover:text-red-500/75 duration-300"/>
                </button>
                <button on:click={() => filterHelp = !filterHelp}>
                    <Icon src={QuestionMarkCircle} class="h-6 w-6 text-violet-500 hover:text-violet-500/75 duration-300"/>
                </button>
            </Flex>
        </Input>
    </Flex>

</div>


