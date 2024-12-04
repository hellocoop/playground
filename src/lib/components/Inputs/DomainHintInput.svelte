<script>
	import { slide } from 'svelte/transition';

	let { selected, value = $bindable() } = $props();

	let invalidSlugs = $state([]);
</script>

<input
	type="text"
	class="border w-full form-input h-6 px-2"
	class:opacity-50={!selected}
	bind:value
/>

{#if invalidSlugs?.length}
	<p class="text-red-500 text-xs mt-2" transition:slide={{ duration: 150 }}>
		{invalidSlugs}
		{invalidSlugs.length > 1 ? 'are unsupported values' : 'is an unsupported value'}
	</p>
{/if}
