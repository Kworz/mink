<script lang="ts">
    import { browser } from "$app/environment";
    import { Collections, type ArticleStoresResponse, type SuppliersResponse } from "$lib/DBTypes";
    import { getPocketbase } from "$lib/pocketbase";
    import { onMount } from "svelte";
    import type { ArticleResponseExpanded } from "../../../routes/app/articles/+page.server";
    import FormInput from "../FormInput.svelte";
    import Flex from "../layout/flex.svelte";

    export let article: ArticleResponseExpanded | undefined = undefined;

    let suppliers: SuppliersResponse[] = [];
    let stores: ArticleStoresResponse[] = [];

    onMount(async () => {

        if(!browser)
            return;
        try {
            const pb = await getPocketbase(document.cookie);  
            suppliers = await pb.collection(Collections.Suppliers).getFullList<SuppliersResponse>();
            stores = await pb.collection(Collections.ArticleStores).getFullList<ArticleStoresResponse>();          
        }
        catch(ex)
        {
            console.log(ex);
        }
    })

</script>

<Flex direction="col" gap={3}>
    
    <h3 class="mb-2">Informations de base</h3>

    <FormInput name="name" label="Nom de l'article" labelMandatory={true} value={article?.name} />
    <FormInput name="reference" label="Référence" value={article?.reference} />
    <FormInput name="manufacturer" label="Fabricant" value={article?.manufacturer} />

    <FormInput type="number" name="quantity" label="Quantité disponible" labelMandatory={true} value={article?.quantity} />
    
    <h3 class="my-2">Informations complémentaires</h3>
    
    <FormInput type="number" label="Prix" name="price" step={0.01} value={article?.price} />
    <FormInput type="number" name="order_quantity" label="Quantité minimale de commande" value={article?.order_quantity} min={1}/>

    <FormInput type="select" name="supplier" label="Fournisseur" value={article?.supplier ?? []}>
        {#each suppliers as supplier}
            <option value={supplier.id}>{supplier.name}</option>
        {/each}
    </FormInput>

    <FormInput type="select" name="store" label="Emplacement" value={article?.store}>
        <option value="">—</option>
        {#each stores as store}
            <option value={store.id}>{store.location} / {store.name}</option>
        {/each}
    </FormInput>

</Flex>