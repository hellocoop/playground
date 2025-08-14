<script>
	import tippy from 'sveltejs-tippy';

	let { placement = 'top' } = $props();
</script>

<span use:tippy={{ content: 'Required', placement }} target="_blank" aria-label="tooltip"> * </span>
