<script lang="ts">
	import {
		aligns,
		directions,
		gaps,
		itemsPosition,
		justifies,
		wraps,
		type FlexAlign,
		type FlexDirection,
		type FlexItemPosition,
		type FlexJustify,
		type FlexWrap,
		type GapSizes,
	} from '$lib/components/layout/flexTypes';

	export let direction: FlexDirection = 'row';
	export let wrap: FlexWrap | null = null;
	export let gap: null | GapSizes = 4;
	export let items: null | FlexItemPosition = null;
	export let justify: null | FlexJustify = null;
	export let align: null | FlexAlign = null;
</script>

<div
	class="flex
	{directions[direction]}
	{gap != null ? gaps[gap] : ''}
	{items != null ? itemsPosition[items] : ''}
	{justify != null ? justifies[justify] : ''}
	{wrap != null ? wraps[wrap] : ''}
	{align != null ? aligns[align] : ''}
	{$$props.class || ''}"
>
	<slot />
</div>
