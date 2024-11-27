<script>
    let { authzUrlResponse, authzUrl } = $props()
</script>

<section class="pb-4">
    <div class="flex flex-col items-start text-left">
        <span class="font-medium" style="word-break: break-word;"
            >{new URL('/authorize', authzUrl)}</span
        >
        <button class="text-sm opacity-70">Copy response</button>
    </div>
    <p class="mt-2 break-words text-sm">{authzUrlResponse}</p>
</section>