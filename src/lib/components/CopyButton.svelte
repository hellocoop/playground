<script>
	let { content, css = '' } = $props();

	let copied = $state(false);
	async function copy() {
		copied = true;
		await navigator.clipboard.writeText(content);
		setTimeout(() => {
			copied = false;
		}, 500);
	}
</script>

<button
	onclick={copy}
	class="w-6 h-6 flex items-center justify-center {css} rounded-md bg-white dark:bg-charcoal"
>
	{#if copied}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="2.5"
			stroke="currentColor"
			class="h-4"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
		</svg>
	{:else}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-5 stroke-[1.5px] hover:stroke-2"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
			/>
		</svg>
	{/if}
</button>
