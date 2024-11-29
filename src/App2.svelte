<script>
    import { onMount } from 'svelte'
    import { PARAMS, AUTHZ_SERVERS } from './constants.js'
    import Header from './lib/Header.svelte'
    import AuthorizationRequest from './lib/AuthorizationRequest.svelte'
    import AuthorizationResponse from './lib/AuthorizationResponse.svelte'
    import InviteRequest from './lib/Request/InviteRequest.svelte'
    import FileIssue from './lib/FileIssue.svelte'
    import { init as initShiki } from './lib/shiki.js'
    import { makeAuthzUrl, makeInviteUrl, cleanUrl, removeLoader } from './lib/utils.js'
    import { parseToken, validateToken, fetchToken } from '@hellocoop/helper-browser'

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
        parsed: null, // code flow does not call introspect -- parses locally
        introspect: null, // id_token flow calls introspect
        userinfo: null
    })
    let dropdowns = $state({
        scope: true,
        protocol: false,
        hello: true,
        server: false,
        request: true
    })

    const claims = $derived(
        // id_token flow            // code flow
        authzResponse.introspect || authzResponse.parsed
    )
    const canInvite = $derived(Boolean(
        claims?.sub &&
        claims?.name &&
        claims?.email
    ))
    const authzUrl = $derived(makeAuthzUrl({
        authzServer: selectedAuthzServer,
        scopes: selectedScopes,
        ptlParams: selectedPtlParams,
        ptlParamsValues: selectedPtlParamsValues,
        helloParams: selectedHelloParams,
        helloParamsValues: selectedHelloParamsValues
    }))
    const inviteUrl = $derived(makeInviteUrl({
        authzServer: selectedAuthzServer,
        claims,
        ptlParamsValues: selectedPtlParamsValues
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
            await processIdToken(params)
        else if (params.has('code'))
            await processCode(params)

        cleanUrl()
        removeLoader()
        await initShiki() // syntax highlighting

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
        try {
            const code = params.get('code');
            if (!code)
                throw new Error('Missing code');
            
            const tokenRes = await fetch(new URL('/oauth/token', selectedAuthzServer), {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({
                    code,
                    code_verifier: selectedPtlParamsValues.code_verifier,
                    client_id: selectedPtlParamsValues.client_id,
                    redirect_uri: selectedPtlParamsValues.redirect_uri,
                    nonce: selectedPtlParamsValues.nonce,
                    grant_type: 'authorization_code'
                }).toString()
            })
            const token = await tokenRes.json()
            // this only returns id_token str and not full json response
            // we need access_token to call userinfo endpoint later
            // const token = await fetchToken()
            if (!token)
                throw new Error('Did not get response from token endpoint');
            authzResponse.token = token
            
            const { payload: profile } = parseToken(token.id_token);
            if (!profile)
                throw new Error('Did not get profile from token');
            authzResponse.parsed = profile
            
            const userinfoRes = await fetch(new URL('/oauth/userinfo', selectedAuthzServer), {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                headers: { Authorization: `Bearer ${token.access_token}` },
            })
            const userinfo = await userinfoRes.json()
            if (!userinfo)
                throw new Error('Did not get userinfo');
            authzResponse.userinfo = userinfo
        } catch (err) {
            console.error(err)
        }
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

        <InviteRequest {canInvite} {inviteUrl} />

        <FileIssue/>
    </main>

    <wc-footer></wc-footer>
{/if}