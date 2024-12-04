<script>
	import UrlResponse from '$components/Response/UrlResponse.svelte';
	import JsonResponse from '$components/Response/JsonResponse.svelte';

	let { authzUrl, authzResponse } = $props();
</script>

<section
	class="relative border border-charcoal dark:border-gray-800 rounded-sm w-full px-4 pb-4 pt-6"
>
	<span
		class="absolute -mt-8 bg-white dark:bg-[#151515] px-2 -mx-2 text-white/50 uppercase text-xs font-mono"
		>Authorization Response</span
	>

	{#if authzResponse.url}
		<div class="divide-y divide-charcoal dark:divide-gray-800">
			<UrlResponse label={new URL('/authorize', authzUrl)} url={authzResponse.url} />

			{#if authzResponse.token}
				<JsonResponse label={new URL('/oauth/token', authzUrl)} json={authzResponse.token} />
			{/if}

			<!-- code flow parses token locally, id_token calls introspect -->
			{#if authzResponse.parsed}
				<JsonResponse label="JSON Payload" json={authzResponse.parsed} />
			{:else if authzResponse.introspect}
				<JsonResponse
					label={new URL('/oauth/introspect', authzUrl)}
					json={authzResponse.introspect}
				/>
			{/if}

			{#if authzResponse.userinfo}
				<JsonResponse label={new URL('/oauth/userinfo', authzUrl)} json={authzResponse.userinfo} />
			{/if}
		</div>
	{:else}
		<p class="text-sm text-center my-4 opacity-70">Nothing to see here yet</p>
	{/if}
</section>
