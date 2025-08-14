<script>
	import { slide } from 'svelte/transition';
	import { PARAMS } from '$lib/constants.js';
	import { validateProtocolParams as validate } from '$lib/validate.js';
	import { generatePkce } from '$lib/utils';
	import { regenerateDpopJkt } from '$lib/dpop.js';
	import ChevronY from '$components/ChevronY.svelte';
	import Tooltip from '$components/Tooltip.svelte';
	import RedoIcon from '../Icons/RedoIcon.svelte';
	import ExperimentalIcon from '../Icons/ExperimentalIcon.svelte';

	let {
		selectedProtocolParams = $bindable(),
		selectedProtocolParamsValues = $bindable(),
		selectedHelloParams,
		selectedHelloParamsValues,
		selectedScopes,
		dropdowns = $bindable()
	} = $props();

	async function regen(param) {
		if (param === 'nonce') {
			const { nonce } = await generatePkce();
			selectedProtocolParamsValues.nonce = nonce;
		} else if (param === 'code_challenge') {
			const { code_challenge, code_verifier } = await generatePkce();
			selectedProtocolParamsValues.code_challenge = code_challenge;
			selectedProtocolParamsValues.code_verifier = code_verifier;
		} else if (param === 'dpop_jkt') {
			const dpopJkt = await regenerateDpopJkt();
			selectedProtocolParamsValues.dpop_jkt = dpopJkt;
		} else {
			console.error('Unknown parameter for regeneration', param);
		}
	}
</script>

<section class="break-inside-avoid-column">
	<button
		class="inline-flex items-center space-x-2"
		onclick={() => (dropdowns.protocol = !dropdowns.protocol)}
	>
		<span class="text-base font-medium"> Protocol Parameters </span>
		<ChevronY dir={dropdowns.protocol ? 'up' : 'down'} />
		<Tooltip
			content="Protocol Parameters Docs"
			href="https://www.hello.dev/docs/oidc/request/#openid-connect-parameters"
		/>
	</button>
	{#if dropdowns.protocol}
		<ul class="mt-2 flex flex-col space-y-2" transition:slide={{ duration: 150 }}>
			{#each PARAMS.PROTOCOL_PARAM.PARAMS as param}
				{@const required = PARAMS.PROTOCOL_PARAM.REQUIRED.includes(param.NAME)}
				{@const selected = selectedProtocolParams.includes(param.NAME)}
				{@const hasValue = !!selectedProtocolParamsValues[param.NAME]}
				{@const requiredOk = !required || (selected && hasValue)}
				{@const needsOk = validate({
					param: param,
					protocolParams: selectedProtocolParams,
					protocolParamsValues: selectedProtocolParamsValues,
					helloParams: selectedHelloParams,
					helloParamsValues: selectedHelloParamsValues,
					selectedScopes: selectedScopes
				})}
				{@const error = !requiredOk || !needsOk}
				<li class="flex flex-col items-start md:flex-row">
					<div class="flex items-center space-x-2">
						<input
							type="checkbox"
							id={param.NAME}
							name="param"
							bind:group={selectedProtocolParams}
							class:invisible={param.CHECKBOX_HIDDEN}
							value={param.NAME}
						/>
						<label
							for={param.NAME}
							class="flex w-48 items-center space-x-2 font-normal"
							class:pointer-events-none={param.CHECKBOX_HIDDEN}
							class:text-red-500={error}
						>
							<span>{param.NAME} {required ? '*' : ''}</span>
							{#if param.EXPERIMENTAL}
								<ExperimentalIcon content="Experimental" href="#" />
							{/if}
							{#if param.REGENERATE}
								<button
									onclick={() => regen(param.NAME)}
									class:opacity-50={!selected}
									class="z-10 inline-flex h-4 w-4 items-center justify-center border border-charcoal bg-charcoal text-white dark:border-gray-800"
								>
									<RedoIcon />
								</button>
							{/if}
						</label>
					</div>
					{#if Array.isArray(param.POSSIBLE_VALUE)}
						<ul
							class="flex w-full flex-col items-center gap-1 rounded-sm p-1 ring-1 ring-charcoal xl:h-8 xl:flex-row dark:ring-gray-800"
							class:opacity-50={!selected}
						>
							{#each param.POSSIBLE_VALUE as value}
								<li class="w-full">
									{#if param.ONLY_ONE}
										<input
											type="radio"
											name={param.NAME}
											id={value}
											{value}
											bind:group={selectedProtocolParamsValues[param.NAME]}
											class="peer !hidden"
										/>
									{:else}
										<input
											type="checkbox"
											name={param.NAME}
											id={value}
											{value}
											bind:group={selectedProtocolParamsValues[param.NAME]}
											class="peer !hidden"
										/>
									{/if}
									<label
										for={value}
										class="block flex w-full cursor-pointer items-center justify-center ring-charcoal peer-checked:bg-charcoal peer-checked:text-white peer-checked:ring-1 dark:ring-gray-800 peer-checked:dark:text-gray"
									>
										{value}
									</label>
								</li>
							{/each}
						</ul>
					{:else}
						<div class="relative flex w-full items-center" class:opacity-50={!selected}>
							<input
								type="text"
								class="form-input h-6 w-full border px-2"
								class:pr-6={param.REGENERATE}
								bind:value={selectedProtocolParamsValues[param.NAME]}
								placeholder={param.PLACEHOLDER}
							/>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>
