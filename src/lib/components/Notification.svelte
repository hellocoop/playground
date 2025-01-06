<script>
	import { slide } from 'svelte/transition';

	let { close } = $props();
</script>

<div
	class="flex h-11 items-center justify-center bg-red-500 px-2.5 text-center text-white md:h-9"
	out:slide
>
	<span class="text-sm"
		>Authorization Error <span class="hidden md:inline">-</span><br class="md:hidden" /> Please see Response
		section below</span
	>
	<button class="absolute right-4" onclick={close} aria-label="close">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="2"
			stroke="currentColor"
			class="h-5 w-5"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
		</svg>
	</button>
</div>
