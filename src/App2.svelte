<script>
    import { onMount } from 'svelte'
    import { PARAMS, AUTHZ_SERVERS } from './constants.js'
    import Header from './lib/Header.svelte'
    import AuthorizationRequest from './lib/AuthorizationRequest.svelte'
    import AuthorizationResponse from './lib/AuthorizationResponse.svelte'
    import Invite from './lib/Request/Invite.svelte'
    import FileIssue from './lib/FileIssue.svelte'
    import { makeAuthzUrl, makeInviteUrl, cleanUrl, removeLoader } from './lib/utils.js'
    import { parseToken } from '@hellocoop/helper-browser'

    let selectedScopes = $state(PARAMS.SCOPE_PARAM.DEFAULT_SELECTED)
    let selectedParams = $state(PARAMS.PROTOCOL_PARAM.DEFAULT_SELECTED)
    let selectedParamsValues = $state(PARAMS.PROTOCOL_PARAM.DEFAULT_VALUES)
    let selectedAuthzServer = $state(AUTHZ_SERVERS.DEFAULT_SELECTED)
    let isHelloMode = $state(false)
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
        authzServer: AUTHZ_SERVERS[0],
        scopes: selectedScopes,
        params: selectedParams,
        paramsValues: selectedParamsValues
    }))
    const inviteUrl = $derived(makeInviteUrl({
        authzServer: AUTHZ_SERVERS[0],
        scopes: selectedScopes,
        params: selectedParams,
        paramsValues: selectedParamsValues
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
            selected_authorization_server: selectedAuthzServer
        })
        localStorage.setItem('states', states)
    }

    function loadStateFromLocalStorage() {
        try {
            const states = JSON.parse(localStorage.getItem('states'))
            selectedScopes = states.scopes
            dropdowns = states.dropdowns
            selectedAuthzServer = states.selected_authorization_server
        } catch(err) {
            console.error(err)
        }
    }

    async function processCode(params) {
        // try {
        //     const code_verifier = sessionStorage.getItem('code_verifier');
        //     const nonce = sessionStorage.getItem('nonce');
        //     const code = params.get('code');
        //     if (!code_verifier)
        //         throw new Error('Missing code_verifier');
        //     if (!nonce)
        //         throw new Error('Missing nonce');
        //     if (!code)
        //         throw new Error('Missing code');

        //     const token = await fetchToken({
        //         client_id: CONFIG.client_id,
        //         redirect_uri: CONFIG.redirect_uri,
        //         code_verifier,
        //         nonce,
        //         code,
        //     });
        //     if (!token)
        //         throw new Error('Did not get response from token endpoint');
        //     const { payload: profile } = parseToken(token);
        //     if (!profile)
        //         throw new Error('Did not get profile from token');
        
        //     sessionStorage.clear();  // clean code_verifier, nonce
        
        //     sessionStorage.setItem('profile', JSON.stringify(profile));
        //     sendPlausibleEvent({ path: '/profile' });
        //     showProfile(profile);
        // } catch (err) {
        //     console.error(err)
        //     sessionStorage.clear();
        //     showLoginPage();
        //     processError(params);
        // } finally {
        //     clearFragment();
        // }
    }

    async function processIdToken(params) {
        try {
            const token = params.get('id_token');
            if (!token)
                throw new Error('Missing id_token');
            
            // tbd call introspect endpoint
            const { payload } = parseToken(token);    
            if (!payload)
                throw new Error('Did not get profile from token');
        
            authzResponse.introspect = payload
        } catch (err) {
        }
    }
</script>

{#if mounted}
    <Header/>

    <main class="py-6 px-4 space-y-6">
        <AuthorizationRequest
            bind:selectedScopes
            bind:selectedParams
            bind:selectedParamsValues
            bind:dropdowns
            bind:isHelloMode
            bind:selectedAuthzServer
            {authzUrl}
        />

        <AuthorizationResponse
            {authzResponse}
        />

        <Invite {inviteUrl}/>

        <FileIssue/>
    </main>

    <wc-footer></wc-footer>
{/if}