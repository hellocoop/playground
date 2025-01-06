<script>
	let { isHelloMode = $bindable() } = $props();
</script>

<div class="absolute absolute right-2 top-4 flex items-center md:-top-3 md:right-18">
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
		@apply block flex h-[22px] w-14 cursor-pointer select-none items-center justify-center border-y border-charcoal bg-white px-3 text-xs peer-checked:bg-charcoal peer-checked:text-white dark:border-gray-800 dark:bg-gray-1000;
	}
</style>
