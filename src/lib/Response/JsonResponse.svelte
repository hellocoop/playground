<script>
    let { authzJsonResponse } = $props()
</script>

<section>
    <pre class="text-xs">
        {JSON.stringify(authzJsonResponse, null, 2)}
    </pre>
</section>