<script lang="ts">
    
    import type { ArticleResponseExpanded } from "../../../routes/app/articles/+page.server";
    export let articleList: Array<ArticleResponseExpanded>;

    export let selectedArticle: ArticleResponseExpanded | undefined = undefined;

</script>

<div>
    {articleList.length}
</div>

