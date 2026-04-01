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
	class="border-charcoal relative w-full rounded-xs border px-4 pt-6 pb-4 dark:border-gray-800"
>
	<span
		class="text-charcoal/70 dark:bg-gray-1000 dark:text-gray/70 absolute -mx-2 -mt-8 bg-white px-2 font-mono text-xs uppercase"
		>Invite Request</span
	>
	<div class="mx-auto max-w-lg">
		{#if canInvite}
			<div
				class="dark:bg-charcoal relative overflow-x-auto rounded-xs bg-[#F2F6FB] p-4 break-words"
			>
				<span class="absolute top-4 right-4">
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
