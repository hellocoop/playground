<script>
	import ScopeParam from '$components/Request/ScopeParam.svelte';
	import ProtocolParams from '$components/Request/ProtocolParams.svelte';
	import HelloParams from '$components/Request/HelloParams.svelte';
	import AuthorizationServer from '$components/Request/AuthorizationServer.svelte';
	import RequestUrl from '$components/Request/RequestUrl.svelte';
	import HelloModeToggle from '$components/Request/HelloModeToggle.svelte';
	import { reset } from '$lib/utils';

	let {
		selectedScopes = $bindable(),
		selectedProtocolParams = $bindable(),
		selectedProtocolParamsValues = $bindable(),
		selectedHelloParams = $bindable(),
		selectedHelloParamsValues = $bindable(),
		dropdowns = $bindable(),
		isHelloMode = $bindable(),
		selectedAuthzServer = $bindable(),
		customScope = $bindable(),
		customAuthzServer = $bindable(),
		authzUrl
	} = $props();
</script>

<section
	class="relative border border-charcoal dark:border-gray-800 rounded-sm w-full px-4 pb-4 pt-6"
>
	<span
		class="absolute -mt-8 bg-white dark:bg-gray-1000 px-2 -mx-2 text-charcoal/70 dark:text-gray/70 uppercase text-xs font-mono"
		>Authorization Request</span
	>
	{#if localStorage.plausible_ignore}
		<HelloModeToggle bind:isHelloMode />
	{/if}
	<button
		onclick={reset}
		class="absolute -top-3 right-2 px-3 py-0.5 rounded-md border border-charcoal dark:border-gray-800 text-xs bg-white dark:bg-gray-1000"
		>Reset</button
	>
	<div class="columns-1 md:columns-2 2xl:columns-3 4xl:columns-4 gap-x-12 space-y-6">
		<ScopeParam
			bind:selectedScopes
			bind:customScope
			bind:dropdowns
			{selectedProtocolParams}
			{isHelloMode}
		/>

		<ProtocolParams
			bind:selectedProtocolParams
			bind:selectedProtocolParamsValues
			bind:dropdowns
			{selectedHelloParams}
			{selectedHelloParamsValues}
		/>

		<HelloParams
			bind:selectedHelloParams
			bind:selectedHelloParamsValues
			bind:dropdowns
			{isHelloMode}
			{selectedProtocolParams}
		/>

		<AuthorizationServer
			bind:dropdowns
			bind:selectedAuthzServer
			bind:customAuthzServer
			{isHelloMode}
		/>

		<RequestUrl bind:dropdowns {authzUrl} />
	</div>
</section>
