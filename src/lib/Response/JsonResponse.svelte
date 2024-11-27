<script>
    import { highlight } from '../shiki.js'
    import CopyText from '../CopyText.svelte'

    let { label, json } = $props()
</script>

<section class="py-4">
    <div class="flex flex-col items-start text-left">
        <span class="font-medium" style="word-break: break-word;"
            >{label}</span
        >
        <CopyText content={JSON.stringify(json,null,2)}/>
    </div>
    <p class="mt-2 break-words text-sm font-sans">
        {@html highlight('json', JSON.stringify(json,null,2))}
    </p>
</section>