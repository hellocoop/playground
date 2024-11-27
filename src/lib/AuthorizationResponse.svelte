<script>
    import UrlResponse from './Response/UrlResponse.svelte'
    import JsonResponse from './Response/JsonResponse.svelte'

    let { authzUrl, authzResponse } = $props()
</script>

<section
    class="relative border border-charcoal dark:border-gray-800 rounded-sm w-full px-4 pb-4 pt-6"
>
    <span
        class="absolute -mt-9 bg-white dark:bg-[#151515] px-2 -mx-2 text-white/50"
        >Authorization Response</span
    >

    {#if authzResponse.url}
        <div class="divide-y divide-charcoal dark:divide-gray-800">
            <UrlResponse {authzUrl} authzUrlResponse={authzResponse.url}/>

            {#if authzResponse.token}
                <JsonResponse {authzUrl} authzJsonResponse={authzResponse.token} />
            {/if}

            {#if authzResponse.userinfo}
                <JsonResponse {authzUrl} authzJsonResponse={authzResponse.userinfo} />
            {/if}

            {#if authzResponse.introspect}
                <JsonResponse {authzUrl} authzJsonResponse={authzResponse.introspect} />
            {/if}
        </div>
    {:else}
        <p class="text-sm text-center my-4 opacity-70">
            Nothing to see here yet
        </p>
    {/if}
</section>