<script>
    import Copy from '../Copy.svelte'

    let { label, json } = $props()
</script>

<section class="py-4">
    <div class="flex flex-col items-start text-left">
        <span class="font-medium" style="word-break: break-word;"
            >{label}</span
        >
        <Copy content={JSON.stringify(json,null,4)}/>
    </div>
    <pre class="mt-2 break-words text-sm font-sans whitespace-pre-wrap">{JSON.stringify(json,null,4)}</pre>
</section>