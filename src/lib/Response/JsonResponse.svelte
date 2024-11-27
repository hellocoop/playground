<script>
    import Copy from '../Copy.svelte'

    let { authzJsonResponse, authzUrl } = $props()
</script>

<section class="py-4">
    <div class="flex flex-col items-start text-left">
        <span class="font-medium" style="word-break: break-word;"
            >{new URL('/oauth/introspect', authzUrl)}</span
        >
        <Copy content={JSON.stringify(authzJsonResponse,null,4)}/>
    </div>
    <pre class="mt-2 break-words text-sm font-sans">{JSON.stringify(authzJsonResponse,null,4)}</pre>
</section>