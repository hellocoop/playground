<script>
	import { slide } from 'svelte/transition';
	import { AUTHZ_SERVERS, HAS_HELLO_DEV_FLAG } from '$lib/constants.js';
	import ChevronY from '$components/ChevronY.svelte';
	import CopyButton from '../CopyButton.svelte';
	import { validateAuthzServer as validate } from '$lib/validate';

	let {
		dropdowns = $bindable(),
		selectedAuthzServer = $bindable(),
		customAuthzServer = $bindable(),
		isHelloMode
	} = $props();
</script>

<section class="break-inside-avoid-column">
	<button
		class="inline-flex items-center space-x-2"
		onclick={() => (dropdowns.server = !dropdowns.server)}
	>
		<span class="text-base font-medium"> Authorization Server </span>
		<ChevronY dir={dropdowns.server ? 'up' : 'down'} />
	</button>
	{#if dropdowns.server}
		{@const showHelloExtended = HAS_HELLO_DEV_FLAG && isHelloMode}
		{@const ALL_AUTHZ_SERVERS = [
			...AUTHZ_SERVERS.SERVERS,
			...(showHelloExtended ? AUTHZ_SERVERS.HELLO_EXTEND_SERVERS : [])
		]}
		<ul class="mt-2 space-y-2" transition:slide|local={{ duration: 150 }}>
			{#each ALL_AUTHZ_SERVERS as server}
				<li class="flex items-center">
					<input
						type="radio"
						name="authz-server"
						value={server}
						id={server}
						class="text-charcoal dark:text-gray-800"
						bind:group={selectedAuthzServer}
					/>
					{#await validate(server)}
						<span class="ml-2">Checking ...</span>
					{:then validateOk}
						<label
							for={server}
							class="ml-2 w-full truncate break-all md:w-auto"
							class:text-red-500={!validateOk}>{server}</label
						>
						<CopyButton content={server} css="opacity-70 ml-1" />
					{/await}
				</li>
			{/each}
			<li class="flex items-center">
				<input
					type="radio"
					name="authz-server"
					class="text-charcoal dark:text-gray-800"
					id="custom-authz-server"
					value="custom-authz-server"
					bind:group={selectedAuthzServer}
				/>
				<input
					form="custom-authz-server"
					type="url"
					name="authz-server"
					class="form-input ml-2 h-6 w-full text-charcoal"
					placeholder="https://domain.example/"
					oninput={() => (selectedAuthzServer = 'custom-authz-server')}
					bind:value={customAuthzServer}
				/>
			</li>
		</ul>
	{/if}
</section>
