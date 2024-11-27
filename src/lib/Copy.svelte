<script>
    let { content } = $props()

    let copied = $state(false)
    async function copy() {
		copied = true;
		await navigator.clipboard.writeText(content);
		setTimeout(() => {
			copied = false;
		}, 500);
	}
</script>

<button onclick={copy} class="text-sm opacity-70">
    {copied ? 'Copied' : 'Copy response'}
</button>