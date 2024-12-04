<script>
	let { dir = 'down' } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	fill="none"
	viewBox="0 0 24 24"
	stroke-width="3"
	stroke="currentColor"
	class="w-4 h-4 mt-0.5"
	class:rotate-180={dir === 'up'}
>
	<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
</svg>
