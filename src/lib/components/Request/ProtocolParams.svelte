<script>
	import { slide } from 'svelte/transition';
	import { PARAMS } from '$lib/constants.js';
	import ChevronY from '$components/ChevronY.svelte';
	import Tooltip from '$components/Tooltip.svelte';
	import { validateProtocolParams as validate } from '$lib/validate.js';

	let {
		selectedProtocolParams = $bindable(),
		selectedProtocolParamsValues = $bindable(),
		selectedHelloParams,
		selectedHelloParamsValues,
		dropdowns = $bindable()
	} = $props();
</script>

<section class="break-inside-avoid-column">
	<button
		class="inline-flex items-center space-x-2"
		onclick={() => (dropdowns.protocol = !dropdowns.protocol)}
	>
		<span class="font-medium text-base"> Protocol Parameters </span>
		<ChevronY dir={dropdowns.protocol ? 'up' : 'down'} />
		<Tooltip
			content="Protocol Parameters Docs"
			href="https://www.hello.dev/docs/oidc/request/#openid-connect-parameters"
		/>
	</button>
	{#if dropdowns.protocol}
		<ul class="flex flex-col mt-2 space-y-2" transition:slide={{ duration: 150 }}>
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
					helloParamsValues: selectedHelloParamsValues
				})}
				{@const error = !requiredOk || !needsOk}
				<li class="flex flex-col md:flex-row items-start">
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
							class="font-normal w-48"
							class:pointer-events-none={param.CHECKBOX_HIDDEN}
							class:text-red-500={error}>{param.NAME} {required ? '*' : ''}</label
						>
					</div>
					{#if Array.isArray(param.POSSIBLE_VALUE)}
						<ul
							class="xl:h-8 p-1 gap-1 w-full ring-1 ring-charcoal dark:ring-gray-800 flex flex-col xl:flex-row items-center rounded-sm"
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
											class="!hidden peer"
										/>
									{:else}
										<input
											type="checkbox"
											name={param.NAME}
											id={value}
											{value}
											bind:group={selectedProtocolParamsValues[param.NAME]}
											class="!hidden peer"
										/>
									{/if}
									<label
										for={value}
										class="peer-checked:bg-charcoal peer-checked:ring-1 ring-charcoal dark:ring-gray-800 block flex justify-center items-center w-full cursor-pointer peer-checked:text-white peer-checked:dark:text-gray"
									>
										{value}
									</label>
								</li>
							{/each}
						</ul>
					{:else}
						<input
							type="text"
							class="border w-full form-input h-6 px-2"
							class:opacity-50={!selected}
							bind:value={selectedProtocolParamsValues[param.NAME]}
							placeholder={param.PLACEHOLDER}
						/>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>
