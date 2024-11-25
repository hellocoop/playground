<script>
    import ScopeParam from './ScopeParam.svelte'
    import ProtocolParams from './ProtocolParams.svelte'
    import HelloParams from './HelloParams.svelte'
    import AuthorizationServer from './AuthorizationServer.svelte'
    import AuthorizationRequestUrl from './AuthorizationRequestUrl.svelte'

    let { 
        selectedScopes = $bindable(),
        selectedParams = $bindable(),
        selectedParamsValues= $bindable(),
        dropdowns = $bindable(),
        authzUrl
    } = $props()
</script>

<section class="relative border border-charcoal dark:border-gray-800 rounded-sm w-full px-4 pb-4 pt-6">
    <span class="absolute -mt-9 bg-white dark:bg-[#151515] px-2 -mx-2 text-white/50">Authorization Request</span>
    <div class="columns-1 md:columns-2 xl:columns-3 4xl:columns-4 gap-x-12 space-y-6">
        <ScopeParam bind:selectedScopes bind:dropdowns/>
    
        <ProtocolParams
            bind:selectedParams
            bind:selectedParamsValues
            bind:dropdowns
        />
    
        <HelloParams
            bind:selectedParams
            bind:selectedParamsValues
            bind:dropdowns
        />
    
        <AuthorizationServer bind:dropdowns/>

        <AuthorizationRequestUrl bind:dropdowns {authzUrl}/>
    </div>
</section>