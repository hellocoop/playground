<script>
	let { isHelloMode = $bindable() } = $props();
</script>

<div class="absolute absolute top-4 right-2 flex items-center md:-top-3 md:right-18">
	<div>
		<input
			id="mode-hello"
			value={true}
			type="radio"
			class="peer !hidden"
			bind:group={isHelloMode}
		/>
		<label for="mode-hello" class="rounded-l-md border-r border-l">Hellō</label>
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
	@reference "../../../app.css";
	label {
		@apply border-charcoal peer-checked:bg-charcoal dark:bg-gray-1000 block flex h-[22px] w-14 cursor-pointer items-center justify-center border-y bg-white px-3 text-xs select-none peer-checked:text-white dark:border-gray-800;
	}
</style>
