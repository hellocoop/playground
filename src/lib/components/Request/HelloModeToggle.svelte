<script>
	let { isHelloMode = $bindable() } = $props();
</script>

<div class="flex items-center absolute absolute top-4 md:-top-3 right-2 md:right-18">
	<div>
		<input
			id="mode-hello"
			value={true}
			type="radio"
			class="peer !hidden"
			bind:group={isHelloMode}
		/>
		<label for="mode-hello" class="rounded-l-md border-l border-r">Hellō</label>
	</div>
	<div>
		<input
			id="mode-public"
			value={false}
			type="radio"
			class="peer !hidden"
			bind:group={isHelloMode}
		/>
		<label for="mode-public" class="rounded-r-md border-r">Public</label>
	</div>
</div>

<style>
	label {
		@apply cursor-pointer select-none px-3 h-[22px] w-14 block flex border-y items-center justify-center border-charcoal dark:border-gray-800 text-xs bg-white dark:bg-[#151515] peer-checked:bg-charcoal peer-checked:text-white;
	}
</style>
