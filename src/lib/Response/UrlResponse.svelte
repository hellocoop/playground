<script>
import Copy from '../Copy.svelte'

    let { label, url } = $props()
</script>

<section class="py-4 first:pt-0">
    <div class="flex flex-col items-start text-left">
        <span class="font-medium" style="word-break: break-word;"
            >{label}</span
        >
        <Copy content={url} />
    </div>
    <p class="mt-2 break-words text-sm">{url}</p>
</section>