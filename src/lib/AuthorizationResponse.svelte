<script>
    import UrlResponse from './Response/UrlResponse.svelte'
    import JsonResponse from './Response/JsonResponse.svelte'

    let { authzResponse } = $props()
</script>

<UrlResponse authzUrlResponse={authzResponse.url} />
<JsonResponse authzJsonResponse={authzResponse.json} />
