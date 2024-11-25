<script>
    import UrlResponse from './Response/UrlResponse.svelte'
    import JsonResponse from './Response/JsonResponse.svelte'

    let { authzResponse } = $props()
</script>

<UrlResponse authzUrlResponse={authzResponse.url} />

{#if authzResponse.token}
    <JsonResponse authzJsonResponse={authzResponse.token} />
{/if}

{#if authzResponse.userinfo}
    <JsonResponse authzJsonResponse={authzResponse.userinfo} />
{/if}

{#if authzResponse.introspect}
    <JsonResponse authzJsonResponse={authzResponse.introspect} />
{/if}
