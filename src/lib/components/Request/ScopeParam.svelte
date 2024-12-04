<script>
	import { slide } from 'svelte/transition';
	import { PARAMS } from '$lib/constants.js';
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
	const isOverwritten = $derived(selectedProtocolParams.includes('scope'));
</script>

<section class="break-inside-avoid-column">
	<button
		class="inline-flex items-center space-x-2"
		onclick={() => (dropdowns.scope = !dropdowns.scope)}
	>
		<span class="font-medium text-base"> Scope Parameter </span>
		<ChevronY dir={dropdowns.scope ? 'up' : 'down'} />
		<Tooltip content="Scope Parameter Docs" , href="https://www.hello.dev/docs/scopes/" />
	</button>

	{#if isOverwritten}
		<p class="opacity-70 text-xs italic mt-1">
			Overwritten with 'scope' in Protocol Parameters section
		</p>
	{/if}

	{#if dropdowns.scope}
		{@const ALL_STANDARD_SCOEPS = [
			...PARAMS.SCOPE_PARAM.STANDARD,
			...(isHelloMode ? PARAMS.SCOPE_PARAM.HELLO_EXTEND_STANDARD : [])
		]}
		{@const ALL_NON_STANDARD_SCOPES = [
			...PARAMS.SCOPE_PARAM.NON_STANDARD,
			...(isHelloMode ? PARAMS.SCOPE_PARAM.HELLO_EXTEND_NON_STANDARD : [])
		]}
		<div
			class="flex mt-2"
			transition:slide={{ duration: 150 }}
			class:opacity-50={isOverwritten}
			class:pointer-events-none={isOverwritten}
		>
			<ul class="space-y-2 w-48">
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
						<label for={stdScope} class:text-red-500={!requiredOk}
							>{stdScope} {required ? '*' : ''}</label
						>
					</li>
				{/each}
			</ul>

			<ul class="space-y-2 w-48">
				{#each ALL_NON_STANDARD_SCOPES as nonStdScope}
					<li class="flex flex-row items-center space-x-2">
						<input
							type="checkbox"
							id={nonStdScope}
							name="scope"
							value={nonStdScope}
							bind:group={selectedScopes}
						/>
						<label for={nonStdScope} class="italic">{nonStdScope}</label>
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
						class="h-6 px-2 w-36 form-input italic"
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
