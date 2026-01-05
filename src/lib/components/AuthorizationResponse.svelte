<script>
	import UrlResponse from '$components/Response/UrlResponse.svelte';
	import JsonResponse from '$components/Response/JsonResponse.svelte';
	import Claims from '$components/Response/Claims.svelte';

	let { authzUrl, authzResponse, refreshIdToken } = $props();

	let isRefreshing = $state(false);

	async function handleRefresh() {
		isRefreshing = true;
		try {
			await refreshIdToken();
		} finally {
			isRefreshing = false;
		}
	}
</script>

<section
	id="authz-response-container"
	class="relative w-full scroll-mt-5 rounded-sm border border-charcoal px-4 pb-4 pt-6 dark:border-gray-800"
>
	<span
		class="absolute -mx-2 -mt-8 bg-white px-2 font-mono text-xs uppercase text-charcoal/70 dark:bg-gray-1000 dark:text-gray/70"
		>Authorization Response</span
	>

	{#if authzResponse.url}
		<div class="divide-y divide-charcoal dark:divide-gray-800">
			<UrlResponse label={new URL('/authorize', authzUrl)} url={authzResponse.url} />

			{#if authzResponse.token}
				<JsonResponse label={new URL('/oauth/token', authzUrl)} json={authzResponse.token} />
			{/if}

			{#if authzResponse.token?.refresh_token}
				<div class="py-4">
					<div class="flex flex-col items-start text-left">
						<span class="font-medium">Refresh id_token</span>
						<button
							class="hello-btn-black-and-static mt-2 h-10 w-32 text-sm disabled:opacity-50"
							class:hello-btn-loader={isRefreshing}
							disabled={isRefreshing}
							onclick={handleRefresh}
						>
							Refresh
						</button>
					</div>
				</div>
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

			{#if authzResponse.token?.id_token && authzResponse.userinfo}
				<JsonResponse label={new URL('/oauth/userinfo', authzUrl)} json={authzResponse.userinfo} />
			{/if}

			{#if authzResponse.parsed || authzResponse.introspect}
				<Claims payload={authzResponse.parsed || authzResponse.introspect} />
			{/if}
		</div>
	{:else}
		<p class="my-4 text-center text-sm opacity-70">Nothing to see here yet</p>
	{/if}
</section>
