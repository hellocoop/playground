<script>
    import ScopeParam from "$components/Request/ScopeParam.svelte";
    import ProtocolParams from "$components/Request/ProtocolParams.svelte";
    import HelloParams from "$components/Request/HelloParams.svelte";
    import AuthorizationServer from "$components/Request/AuthorizationServer.svelte";
    import RequestUrl from "$components/Request/RequestUrl.svelte";
    import HelloModeToggle from "$components/Request/HelloModeToggle.svelte";

    let {
        selectedScopes = $bindable(),
        selectedPtlParams = $bindable(),
        selectedPtlParamsValues = $bindable(),
        selectedHelloParams = $bindable(),
        selectedHelloParamsValues = $bindable(),
        dropdowns = $bindable(),
        isHelloMode = $bindable(),
        selectedAuthzServer = $bindable(),
        customScopeValue = $bindable(),
        authzUrl
    } = $props();

    function reset() {
        localStorage.removeItem('states')
        window.location.reload()
    }
</script>

<section
    class="relative border border-charcoal dark:border-gray-800 rounded-sm w-full px-4 pb-4 pt-6"
>
    <span
        class="absolute -mt-9 bg-white dark:bg-[#151515] px-2 -mx-2 text-white/50"
        >Authorization Request</span
    >
    {#if localStorage.plausible_ignore}
        <HelloModeToggle bind:isHelloMode />
    {/if}
    <button
        onclick={reset}
        class="absolute -top-3 right-2 px-3 py-0.5 rounded-md border border-charcoal dark:border-gray-800 text-xs bg-white dark:bg-[#151515]"
        >Reset</button
    >
    <div
        class="columns-1 md:columns-2 xl:columns-3 4xl:columns-4 gap-x-12 space-y-6"
    >
        <ScopeParam bind:selectedScopes bind:customScopeValue bind:dropdowns {selectedPtlParams} {isHelloMode} />

        <ProtocolParams
            bind:selectedPtlParams
            bind:selectedPtlParamsValues
            bind:dropdowns
        />

        <HelloParams
            bind:selectedHelloParams
            bind:selectedHelloParamsValues
            bind:dropdowns
            {isHelloMode}
        />

        <AuthorizationServer bind:dropdowns bind:selectedAuthzServer {isHelloMode} />

        <RequestUrl bind:dropdowns {authzUrl} />
    </div>
</section>
