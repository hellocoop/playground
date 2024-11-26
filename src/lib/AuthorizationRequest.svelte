<script>
    import ScopeParam from "./Request/ScopeParam.svelte";
    import ProtocolParams from "./Request/ProtocolParams.svelte";
    import HelloParams from "./Request/HelloParams.svelte";
    import AuthorizationServer from "./Request/AuthorizationServer.svelte";
    import RequestUrl from "./Request/RequestUrl.svelte";

    let {
        selectedScopes = $bindable(),
        selectedParams = $bindable(),
        selectedParamsValues = $bindable(),
        dropdowns = $bindable(),
        isHelloMode = $bindable(),
        selectedAuthzServer = $bindable(),
        authzUrl,
    } = $props();
</script>

<section
    class="relative border border-charcoal dark:border-gray-800 rounded-sm w-full px-4 pb-4 pt-6"
>
    <span
        class="absolute -mt-9 bg-white dark:bg-[#151515] px-2 -mx-2 text-white/50"
        >Authorization Request</span
    >
    {#if localStorage.plausible_ignore}
        <div class="flex items-center absolute absolute -top-3.5 right-18">
            <div>
                <input
                    id="mode-hello"
                    value={true}
                    type="radio"
                    class="peer hidden"
                    bind:group={isHelloMode}
                />
                <label
                    for="mode-hello"
                    class="cursor-pointer select-none rounded-l-full px-3 py-0.5 rounded-xl border-l border-y border-charcoal dark:border-gray-800 text-sm bg-white dark:bg-[#151515] peer-checked:bg-charcoal peer-checked:text-white"
                    ><span class="hidden xs:inline">Hell</span>ō</label
                >
            </div>
            <div>
                <input
                    id="mode-public"
                    value={false}
                    type="radio"
                    class="peer hidden"
                    bind:group={isHelloMode}
                />
                <label
                    for="mode-public"
                    class="cursor-pointer select-none rounded-r-full px-3 py-0.5 rounded-xl border border-charcoal dark:border-gray-800 text-sm bg-white dark:bg-[#151515] peer-checked:bg-charcoal peer-checked:text-white"
                    >P<span class="hidden xs:inline">ublic</span></label
                >
            </div>
        </div>
    {/if}
    <!-- <button
        onclick={resetAll}
        class="absolute -top-3 right-1 px-3 rounded-xl border border-charcoal dark:border-gray-800 text-sm bg-white dark:bg-[#151515]"
        >Reset</button
    > -->
    <div
        class="columns-1 md:columns-2 xl:columns-3 4xl:columns-4 gap-x-12 space-y-6"
    >
        <ScopeParam bind:selectedScopes bind:dropdowns {isHelloMode} />

        <ProtocolParams
            bind:selectedParams
            bind:selectedParamsValues
            bind:dropdowns
            {isHelloMode}
        />

        <HelloParams
            bind:selectedParams
            bind:selectedParamsValues
            bind:dropdowns
            {isHelloMode}
        />

        <AuthorizationServer bind:dropdowns bind:selectedAuthzServer />

        <RequestUrl bind:dropdowns {authzUrl} />
    </div>
</section>
