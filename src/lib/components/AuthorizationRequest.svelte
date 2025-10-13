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
	class="relative w-full rounded-sm border border-charcoal px-4 pb-4 pt-6 dark:border-gray-800"
>
	<span
		class="absolute -mx-2 -mt-8 bg-white px-2 font-mono text-xs uppercase text-charcoal/70 dark:bg-gray-1000 dark:text-gray/70"
		>Authorization Request</span
	>
	{#if localStorage.plausible_ignore}
		<HelloModeToggle bind:isHelloMode />
	{/if}
	<button
		onclick={reset}
		class="absolute -top-3 right-2 rounded-md border border-charcoal bg-white px-3 py-0.5 text-xs dark:border-gray-800 dark:bg-gray-1000"
		>Reset</button
	>
	<div class="columns-1 gap-x-12 space-y-6 md:columns-2 2xl:columns-3 4xl:columns-4">
		<ScopeParam
			bind:selectedScopes
			bind:customScope
			bind:dropdowns
			{selectedProtocolParams}
			{selectedProtocolParamsValues}
			{isHelloMode}
		/>

		<ProtocolParams
			bind:selectedProtocolParams
			bind:selectedProtocolParamsValues
			bind:dropdowns
			{selectedHelloParams}
			{selectedHelloParamsValues}
			{selectedScopes}
			{isHelloMode}
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
