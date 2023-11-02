<script lang="ts">
	import { browser } from '$app/environment';
	import { navigating } from '$app/stores';
	import { fly } from 'svelte/transition';

	let isNavigating = false;

	const delay = (): Promise<void> => { return new Promise<void>(resolve => setTimeout(resolve, 100)) };

	$: if($navigating != null) { isNavigating = true }
	$: if($navigating == null) { isNavigating = false }
</script>

{#if isNavigating && browser}
	{#await delay() then}
		<div
			class="fixed top-0 left-0 right-0 z-50 h-[6px] bg-gradient-to-r from-indigo-500 to-fuchsia-500 via-orange-500 hue-rotate duration-300"
			in:fly
			out:fly
		/>		
	{/await}
{/if}

<style>
	@keyframes gradientMove {
		0% {
			background-position: 10% 0%;
		}
		50% {
			background-position: 91% 100%;
		}
		100% {
			background-position: 10% 0%;
		}
	}

	.hue-rotate {
		background-size: 200%;
		animation: gradientMove infinite 2.5s ease-in-out;
	}
</style>
