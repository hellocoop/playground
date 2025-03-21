<script>
	import { slide } from 'svelte/transition';
	import { PARAMS, HAS_HELLO_DEV_FLAG } from '$lib/constants.js';
	import ChevronY from '$components/ChevronY.svelte';
	import Tooltip from '$components/Tooltip.svelte';
	import ProviderHintInput from '$components/Inputs/ProviderHintInput.svelte';
	import DomainHintInput from '$components/Inputs/DomainHintInput.svelte';
	import { validateHelloParams as validate } from '$lib/validate.js';

	let {
		selectedHelloParams = $bindable(),
		selectedHelloParamsValues = $bindable(),
		dropdowns = $bindable(),
		selectedProtocolParams,
		isHelloMode
	} = $props();
</script>

<section class="break-inside-avoid-column">
	<button
		class="inline-flex items-center space-x-2"
		onclick={() => (dropdowns.hello = !dropdowns.hello)}
	>
		<span class="text-base font-medium"> Hellō Parameters </span>
		<ChevronY dir={dropdowns.hello ? 'up' : 'down'} />
		<Tooltip
			content="Hellō Parameters Docs"
			href="https://www.hello.dev/docs/oidc/request/#hellō-parameters"
		/>
	</button>
	{#if dropdowns.hello}
		{@const showHelloExtended = HAS_HELLO_DEV_FLAG && isHelloMode}
		{@const ALL_HELLO_PARAMS = [
			...PARAMS.HELLO_PARAM.PARAMS,
			...(showHelloExtended ? PARAMS.HELLO_PARAM.HELLO_EXTEND_PARAMS : [])
		]}
		<ul class="mt-2 flex flex-col justify-center space-y-2" transition:slide={{ duration: 150 }}>
			{#each ALL_HELLO_PARAMS as param}
				{@const required = PARAMS.HELLO_PARAM.REQUIRED.includes(param.NAME)}
				{@const selected = selectedHelloParams.includes(param.NAME)}
				{@const validateOk = validate({
					param,
					protocolParams: selectedProtocolParams,
					helloParams: selectedHelloParams,
					helloParamsValues: selectedHelloParamsValues
				})}

				{#if param.NAME === 'custom'}
					<hr class="border-charcoal dark:border-gray-800" />
				{/if}

				<li class="flex flex-col items-start md:flex-row">
					<div class="flex items-center space-x-2">
						<input
							type="checkbox"
							id={param.NAME}
							name="param"
							bind:group={selectedHelloParams}
							value={param.NAME}
						/>
						<label for={param.NAME} class="w-48 font-normal" class:text-red-500={!validateOk}
							>{param.NAME} {required ? '*' : ''}</label
						>
					</div>
					<div class="flex w-full flex-col">
						{#if param.NAME === 'provider_hint'}
							<ProviderHintInput {selected} bind:value={selectedHelloParamsValues.provider_hint} />
						{:else if param.NAME === 'domain_hint'}
							<DomainHintInput {selected} bind:value={selectedHelloParamsValues.domain_hint} />
						{:else}
							<input
								type="text"
								class="form-input h-6 w-full border px-2"
								class:opacity-50={!selected}
								bind:value={selectedHelloParamsValues[param.NAME]}
								placeholder={param.PLACEHOLDER}
							/>
						{/if}
						{#if param.HINT}
							<p class="mt-1 text-xs opacity-70">
								{param.HINT}
							</p>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>
