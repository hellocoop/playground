<script>
	import UrlResponse from '$components/Response/UrlResponse.svelte';
	import JsonResponse from '$components/Response/JsonResponse.svelte';
	import Claims from '$components/Response/Claims.svelte';

	let { authzUrl, authzResponse } = $props();
</script>

<section
	id="authz-response-container"
	class="relative border border-charcoal dark:border-gray-800 rounded-sm w-full px-4 pb-4 pt-6 scroll-mt-5"
>
	<span
		class="absolute -mt-8 bg-white dark:bg-gray-1000 px-2 -mx-2 text-charcoal/70 dark:text-gray/70 uppercase text-xs font-mono"
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

			{#if authzResponse.parsed || authzResponse.introspect}
				<Claims payload={authzResponse.parsed || authzResponse.introspect} />
			{/if}
		</div>
	{:else}
		<p class="text-sm text-center my-4 opacity-70">Nothing to see here yet</p>
	{/if}
</section>
