<script lang="ts" context="module">

	export type columnAmount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

	export const colSpans: Record<columnAmount, string> = {
		1: 'col-span-1',
		2: 'col-span-2',
		3: 'col-span-3',
		4: 'col-span-4',
		5: 'col-span-5',
		6: 'col-span-6',
		7: 'col-span-7',
		8: 'col-span-8',
		9: 'col-span-9',
		10: 'col-span-10',
		11: 'col-span-11',
		12: 'col-span-12'
	};

	export const colsData: Record<columnAmount, string> = {
		1: 'grid-cols-1',
		2: 'grid-cols-2',
		3: 'grid-cols-3',
		4: 'grid-cols-4',
		5: 'grid-cols-5',
		6: 'grid-cols-6',
		7: 'grid-cols-7',
		8: 'grid-cols-8',
		9: 'grid-cols-9',
		10: 'grid-cols-10',
		11: 'grid-cols-11',
		12: 'grid-cols-12',
	};


</script>

<script lang="ts">

	import { itemsPosition, gaps } from "$lib/components/generics/layout/flex.svelte";
	/**
	 * Columns amount
	 */
	export let cols: null | keyof typeof colsData = 1;
	export let items: null | keyof typeof itemsPosition = null;

	/**
	 * Gap between items
	 */
	export let gap: null | keyof typeof gaps = 4;

</script>

<div
	class="grid 
	{cols != null ? colsData[cols] : ''}
	{gap != null ? gaps[gap] : ''}
	{items != null ? itemsPosition[items] : ''}
	{$$props.class || ''}"
>
	<slot />
</div>
