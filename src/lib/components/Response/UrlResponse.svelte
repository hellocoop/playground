<script>
	import { highlight } from '$lib/shiki.js';
	import { lineBreakUrl } from '$lib/utils.js';
	import CopyText from '$components/CopyText.svelte';

	let { label, url } = $props();
</script>

<section class="py-4 first:pt-0">
	<div class="flex flex-col items-start text-left">
		<span class="font-medium" style="word-break: break-word;">{label}</span>
		<CopyText content={url} />
	</div>
	<p class="mt-2 break-words text-sm">
		{@html highlight('http', lineBreakUrl(url))}
	</p>
</section>
