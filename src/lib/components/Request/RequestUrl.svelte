<script>
	import { highlight } from '$lib/shiki.js';
	import { lineBreakUrl } from '$lib/utils.js';
	import CopyButton from '$components/CopyButton.svelte';
	import { slide } from 'svelte/transition';

	let { dropdowns = $bindable(), authzUrl } = $props();

	let continueWithHelloAjax = $state(false);
	async function continueWithHello() {
		continueWithHelloAjax = true;
		window.location.href = authzUrl;
	}
</script>

<div class="break-inside-avoid-column">
	<div class="flex items-center">
		<button
			class="inline-flex items-center space-x-2"
			onclick={() => (dropdowns.request = !dropdowns.request)}
		>
			<h1 class="font-medium">Request URL</h1>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="3"
				stroke="currentColor"
				class="w-4 h-4"
				class:rotate-180={dropdowns.request}
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
			</svg>
		</button>
	</div>
	{#if dropdowns.request}
		<div class="relative" transition:slide={{ duration: 150 }}>
			<div
				class="bg-[#F2F6FB] dark:bg-charcoal rounded-sm p-4 break-words mt-2 relative overflow-x-auto"
			>
				<span class="absolute right-4 top-4">
					<CopyButton content={authzUrl} />
				</span>
				<span class="url-container block text-sm">
					{@html highlight('http', lineBreakUrl(authzUrl))}
				</span>
			</div>
		</div>
	{/if}

	<!-- class:hello-btn-hover-flare={darkMode} -->
	<button
		onclick={continueWithHello}
		class="hello-btn-black-and-static w-full flex mt-3"
		class:hello-btn-loader={continueWithHelloAjax}
		disabled={continueWithHelloAjax}>ō&nbsp;&nbsp;&nbsp;Continue with Hellō</button
	>
</div>
