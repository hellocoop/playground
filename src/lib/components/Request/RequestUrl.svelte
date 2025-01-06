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
				class="h-4 w-4"
				class:rotate-180={dropdowns.request}
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
			</svg>
		</button>
	</div>
	{#if dropdowns.request}
		<div class="relative" transition:slide={{ duration: 150 }}>
			<div
				class="relative mt-2 overflow-x-auto break-words rounded-sm bg-[#F2F6FB] p-4 dark:bg-charcoal"
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
		class="hello-btn-black-and-static hello-btn-hover-flare mt-3 flex w-full"
		class:hello-btn-loader={continueWithHelloAjax}
		disabled={continueWithHelloAjax}>ō&nbsp;&nbsp;&nbsp;Continue with Hellō</button
	>
</div>
