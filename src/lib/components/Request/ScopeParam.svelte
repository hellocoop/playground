<script>
	import { slide } from 'svelte/transition';
	import { PARAMS, HAS_HELLO_DEV_FLAG } from '$lib/constants.js';
	import ChevronY from '$components/ChevronY.svelte';
	import Tooltip from '$components/Tooltip.svelte';
	import { validateScopes as validate } from '$lib/validate.js';

	let {
		selectedScopes = $bindable(),
		dropdowns = $bindable(),
		customScope = $bindable(),
		selectedProtocolParams,
		isHelloMode
	} = $props();

	// scope input selected in protocol params
	const isOverridden = $derived(selectedProtocolParams.includes('scope'));
</script>

<section class="break-inside-avoid-column">
	<button
		class="inline-flex items-center space-x-2"
		onclick={() => (dropdowns.scope = !dropdowns.scope)}
	>
		<span class="text-base font-medium"> Scope Parameter </span>
		<ChevronY dir={dropdowns.scope ? 'up' : 'down'} />
		<Tooltip content="Scope Parameter Docs" href="https://www.hello.dev/docs/scopes/" />
	</button>

	{#if isOverridden}
		<p class="mt-1 text-xs italic opacity-70">
			Overridden with 'scope' in Protocol Parameters section
		</p>
	{/if}

	{#if dropdowns.scope}
		{@const showHelloExtended = HAS_HELLO_DEV_FLAG && isHelloMode}
		{@const ALL_STANDARD_SCOEPS = [
			...PARAMS.SCOPE_PARAM.STANDARD,
			...(showHelloExtended ? PARAMS.SCOPE_PARAM.HELLO_EXTEND_STANDARD : [])
		]}
		{@const ALL_NON_STANDARD_SCOPES = [
			...PARAMS.SCOPE_PARAM.NON_STANDARD,
			...(showHelloExtended ? PARAMS.SCOPE_PARAM.HELLO_EXTEND_NON_STANDARD : [])
		]}
		<div
			class="mt-2 flex space-x-2"
			transition:slide={{ duration: 150 }}
			class:opacity-50={isOverridden}
			class:pointer-events-none={isOverridden}
		>
			<ul class="w-40 space-y-2 md:w-48">
				{#each ALL_STANDARD_SCOEPS as stdScope}
					{@const required = PARAMS.SCOPE_PARAM.REQUIRED.includes(stdScope)}
					{@const selected = selectedScopes.includes(stdScope)}
					{@const requiredOk = !required || selected}
					{@const validateOk = validate(stdScope, selectedScopes)}
					<li class="flex flex-row items-center space-x-2" class:opacity-50={!validateOk}>
						<input
							type="checkbox"
							id={stdScope}
							name="scope"
							bind:group={selectedScopes}
							value={stdScope}
						/>
						<label for={stdScope} class:text-red-500={!requiredOk} class="truncate"
							>{stdScope} {required ? '*' : ''}</label
						>
					</li>
				{/each}
			</ul>

			<ul class="w-40 space-y-2 md:w-48">
				{#each ALL_NON_STANDARD_SCOPES as nonStdScope}
					<li class="flex flex-row items-center space-x-2">
						<input
							type="checkbox"
							id={nonStdScope}
							name="scope"
							value={nonStdScope}
							bind:group={selectedScopes}
						/>
						<label for={nonStdScope} class="truncate italic">{nonStdScope}</label>
					</li>
				{/each}

				<li class="flex flex-row items-center space-x-2">
					<input
						type="checkbox"
						id="custom-scope"
						name="scope"
						value="custom-scope"
						bind:group={selectedScopes}
					/>
					<input
						class:opacity-50={!selectedScopes.includes('custom-scope')}
						form="custom-scope"
						type="text"
						class="form-input h-6 w-32 px-2 italic md:w-40"
						autocomplete="off"
						autocorrect="off"
						autocapitalize="off"
						spellcheck="false"
						placeholder="space separated"
						bind:value={customScope}
					/>
				</li>
			</ul>
		</div>
	{/if}
</section>
