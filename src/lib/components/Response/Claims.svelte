<script>
	import { PARAMS } from '$lib/constants.js';

	const {
		SCOPE_PARAM: { STANDARD, NON_STANDARD, HELLO_EXTEND_STANDARD, HELLO_EXTEND_NON_STANDARD }
	} = PARAMS;
	const ALL_SCOPES = [
		'sub',
		STANDARD,
		NON_STANDARD,
		HELLO_EXTEND_STANDARD,
		HELLO_EXTEND_NON_STANDARD
	].flat();

	let { payload } = $props();
</script>

<section class="pt-4">
	<div class="flex flex-col items-start text-left">
		<span class="font-medium" style="word-break: break-word;">Claims</span>
	</div>
	<ul class="mt-2 flex flex-col overflow-x-auto break-words font-sans text-sm">
		{#each ALL_SCOPES.filter((i) => payload[i]) as claim}
			{@const isString = typeof payload[claim] == 'string'}
			<li
				class="flex flex-col items-start rounded-md px-2 py-2 odd:bg-[#F2F6FB] md:flex-row md:items-center odd:dark:bg-charcoal/60"
			>
				<div class="w-full flex-shrink-0 font-medium md:w-1/3">{claim}</div>
				<div class="flex items-center space-x-2">
					{#if claim === 'picture' && payload[claim]}
						<!-- svelte-ignore a11y_img_redundant_alt -->
						<img
							src={payload[claim]}
							class="object-fit h-10 w-10 rounded-full"
							alt="Picture claim"
						/>
						<a href={payload[claim]} target="_blank" class="text-xs opacity-70 hover:underline"
							>{payload[claim]}</a
						>
					{:else if isString}
						{payload[claim]}
					{:else}
						<pre>{JSON.stringify(payload[claim], null, 2)}</pre>
					{/if}
				</div>
			</li>
		{/each}
	</ul>
</section>
