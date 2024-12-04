<script>
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { PARAMS } from '$lib/constants.js';

	const {
		HELLO_PARAM: { PARAMS: HELLO_PARAMS }
	} = PARAMS;

	let { selected, value = $bindable() } = $props();

	let debouncer = $state();
	let invalidSlugs = $state([]);

	// validate on input load as well
	onMount(validate);

	const PROVIDER_HINT = HELLO_PARAMS.find((i) => i.NAME === 'provider_hint');
	function validate() {
		clearTimeout(debouncer);
		debouncer = setTimeout(() => {
			const valueArr = value?.split(' ');
			invalidSlugs = valueArr
				?.map((i) => i.replace('--', ''))
				.filter((i) => !PROVIDER_HINT.POSSIBLE_VALUE.includes(i) && i);
		}, 250);
	}
</script>

<input
	type="text"
	class="border w-full form-input h-6 px-2"
	class:opacity-50={!selected}
	oninput={validate}
	bind:value
/>

{#if invalidSlugs?.length}
	<p class="text-red-500 text-xs mt-2" transition:slide={{ duration: 150 }}>
		{invalidSlugs}
		{invalidSlugs.length > 1 ? 'are unsupported values' : 'is an unsupported value'}
	</p>
{/if}
