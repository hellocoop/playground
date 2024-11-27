<script>
    import { onMount } from 'svelte'
    import { PARAMS, AUTHZ_SERVERS } from './constants.js'
    import Header from './lib/Header.svelte'
    import AuthorizationRequest from './lib/AuthorizationRequest.svelte'
    import AuthorizationResponse from './lib/AuthorizationResponse.svelte'
    import Invite from './lib/Request/Invite.svelte'
    import FileIssue from './lib/FileIssue.svelte'
    import { makeAuthzUrl, makeInviteUrl, cleanUrl, removeLoader } from './lib/utils.js'
    import { parseToken, validateToken } from '@hellocoop/helper-browser'

    let selectedScopes = $state(PARAMS.SCOPE_PARAM.DEFAULT_SELECTED)
    let selectedPtlParams = $state(PARAMS.PROTOCOL_PARAM.DEFAULT_SELECTED)
    let selectedPtlParamsValues = $state(PARAMS.PROTOCOL_PARAM.DEFAULT_VALUES)
    let selectedHelloParams = $state(PARAMS.HELLO_PARAM.DEFAULT_SELECTED)
    let selectedHelloParamsValues = $state(PARAMS.HELLO_PARAM.DEFAULT_VALUES)
    let selectedAuthzServer = $state(AUTHZ_SERVERS.DEFAULT_SELECTED)
    let isHelloMode = $state(true) // this only matters if flag is set
    let mounted = $state(false)
    let authzResponse = $state({
        url: null,
        token: null,
        userinfo: null,
        introspect: null
    })
    let dropdowns = $state({
        scope: true,
        protocol: false,
        hello: true,
        server: false,
        request: true
    })

    const authzUrl = $derived(makeAuthzUrl({
        authzServer: selectedAuthzServer,
        scopes: selectedScopes,
        ptlParams: selectedPtlParams,
        ptlParamsValues: selectedPtlParamsValues,
        helloParams: selectedHelloParams,
        helloParamsValues: selectedHelloParamsValues
    }))
    const inviteUrl = $derived(makeInviteUrl({
        authzServer: selectedAuthzServer
    }))

    // save state to local storage
    // this runs everytime there is a state change
    $effect(saveStateToLocalStorage)

    onMount(async () => {
        loadStateFromLocalStorage()

        const { search } = window.location;
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(search || hash);

        authzResponse.url = params.toString()

        if (params.has('id_token'))
            processIdToken(params)
        else if (params.has('code'))
            processCode(params)

        cleanUrl()
        removeLoader()
        mounted = true
    })

    function saveStateToLocalStorage() {
        // avoid overwriting existing state on page load
        // wait for the page to mount and read state from local storage
        if (!mounted) return

        const states = JSON.stringify({
            scopes: selectedScopes,
            dropdowns,
            server: selectedAuthzServer,
            ptl_params: selectedPtlParams,
            ptl_params_values: selectedPtlParamsValues,
            hello_params: selectedHelloParams,
            hello_params_values: selectedHelloParamsValues
        })
        localStorage.setItem('states', states)
    }

    function loadStateFromLocalStorage() {
        try {
            const states = JSON.parse(localStorage.getItem('states'))
            if (states.scopes) selectedScopes = states.scopes
            if (states.dropdowns) dropdowns = states.dropdowns
            if (states.server) selectedAuthzServer = states.server
            if (states.ptl_params) selectedPtlParams = states.ptl_params
            if (states.ptl_params_values) selectedPtlParamsValues = states.ptl_params_values
            if (states.hello_params) selectedHelloParams = states.hello_params
            if (states.hello_params_values) selectedHelloParamsValues = states.hello_params_values
        } catch(err) {
            console.error(err)
        }
    }

    async function processCode(params) {
    }

    async function processIdToken(params) {
        try {
            const token = params.get('id_token');
            if (!token)
                throw new Error('Missing id_token');
            
            const payload = await validateToken({
                token,
                client_id: selectedPtlParamsValues.client_id,
                nonce: selectedPtlParamsValues.nonce,
                
                // because helper-browser adds ''/authorize'
                wallet: selectedAuthzServer.replace('/authorize', '')
            })
            authzResponse.introspect = payload
            console.log(payload)
        } catch (err) {
            console.error(err)
        }
    }
</script>

{#if mounted}
    <Header/>

    <main class="py-6 px-4 space-y-6">
        <AuthorizationRequest
            bind:selectedScopes
            bind:selectedPtlParams
            bind:selectedPtlParamsValues
            bind:selectedHelloParams
            bind:selectedHelloParamsValues
            bind:dropdowns
            bind:isHelloMode
            bind:selectedAuthzServer
            {authzUrl}
        />

        <AuthorizationResponse
            {authzUrl}
            {authzResponse}
        />

        <Invite {inviteUrl}/>

        <FileIssue/>
    </main>

    <wc-footer></wc-footer>
{/if}