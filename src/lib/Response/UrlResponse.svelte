<script>
import Copy from '../Copy.svelte'

    let { authzUrlResponse, authzUrl } = $props()
</script>

<section class="pb-4">
    <div class="flex flex-col items-start text-left">
        <span class="font-medium" style="word-break: break-word;"
            >{new URL('/authorize', authzUrl)}</span
        >
        <Copy content={authzUrlResponse} />
    </div>
    <p class="mt-2 break-words text-sm">{authzUrlResponse}</p>
</section>