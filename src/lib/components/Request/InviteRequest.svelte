<script>
	import { highlight } from '$lib/shiki.js';
	import { lineBreakUrl } from '$lib/utils.js';
	import CopyButton from '$components/CopyButton.svelte';

	let { inviteUrl, canInvite = false } = $props();

	let inviteWithHelloAjax = $state(false);
	async function inviteWithHello() {
		inviteWithHelloAjax = true;
		window.location.href = inviteUrl;
	}
</script>

<section
	class="relative w-full rounded-sm border border-charcoal px-4 pb-4 pt-6 dark:border-gray-800"
>
	<span
		class="absolute -mx-2 -mt-8 bg-white px-2 font-mono text-xs uppercase text-charcoal/70 dark:bg-gray-1000 dark:text-gray/70"
		>Invite Request</span
	>
	<div class="mx-auto max-w-lg">
		{#if canInvite}
			<div
				class="relative overflow-x-auto break-words rounded-sm bg-[#F2F6FB] p-4 dark:bg-charcoal"
			>
				<span class="absolute right-4 top-4">
					<CopyButton content={inviteUrl} />
				</span>
				<h2 class="inline-flex items-center space-x-1 font-medium">Invite URL</h2>
				<span class="url-container mt-2 block text-sm">
					{@html highlight('http', lineBreakUrl(inviteUrl))}
				</span>
			</div>
		{/if}

		<button
			onclick={inviteWithHello}
			class="hello-btn-black-and-static hello-btn-hover-flare mt-3 w-full disabled:opacity-30"
			class:hello-btn-loader={inviteWithHelloAjax}
			disabled={inviteWithHelloAjax || !canInvite}>Invite others to Playground</button
		>
		<p class="mt-2 text-center text-sm opacity-70">
			{#if canInvite}
				Use this to test sending invitations
			{:else}
				To invite others, your must provide the<br />`name` and `email` claims
			{/if}
		</p>
	</div>
</section>
