<script>
    import { onMount } from 'svelte'
    import { PARAMS, AUTHZ_SERVERS } from './constants.js'
    import Header from './lib/Header.svelte'
    import ScopeParam from './lib/ScopeParam.svelte'
    import ProtocolParams from './lib/ProtocolParams.svelte'
    import HelloParams from './lib/HelloParams.svelte'
    import AuthorizationServer from './lib/AuthorizationServer.svelte'
    import AuthorizationUrlResponse from './lib/AuthorizationUrlResponse.svelte'
    import AuthorizationJsonResponse from './lib/AuthorizationJsonResponse.svelte'
    import InviteRequest from './lib/InviteRequest.svelte'
    import { makeAuthzUrl, makeInviteUrl, cleanUrl } from './lib/utils.js'
    import { parseToken, fetchToken } from '@hellocoop/helper-browser'

    let selectedScopes = $state(PARAMS.SCOPE_PARAM.DEFAULT_SELECTED)
    let selectedParams = $state(Object.keys(PARAMS.PROTOCOL_PARAM.DEFAULT_SELECTED))
    let selectedParamsValues = $state(PARAMS.PROTOCOL_PARAM.DEFAULT_SELECTED)
    let authzUrlResponse = $state(null)
    let authzJsonResponse = $state(null)

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
        const { search } = window.location;
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(search || hash);

        authzUrlResponse = params.toString()

        if (params.has('id_token'))
            processIdToken(params)
        else if (params.has('code'))
            processCode(params)

        cleanUrl()
        removeLoader()
    })

    function saveStateToLocalStorage() {
        const state = JSON.stringify({
            scopes: selectedScopes
        })
        localStorage.setItem('state', state)
    }

    async function processCode(params) {
        try {
            const code_verifier = sessionStorage.getItem('code_verifier');
            const nonce = sessionStorage.getItem('nonce');
            const code = params.get('code');
            if (!code_verifier)
                throw new Error('Missing code_verifier');
            if (!nonce)
                throw new Error('Missing nonce');
            if (!code)
                throw new Error('Missing code');

            const token = await fetchToken({
                client_id: CONFIG.client_id,
                redirect_uri: CONFIG.redirect_uri,
                code_verifier,
                nonce,
                code,
            });
            if (!token)
                throw new Error('Did not get response from token endpoint');
            const { payload: profile } = parseToken(token);
            if (!profile)
                throw new Error('Did not get profile from token');
        
            sessionStorage.clear();  // clean code_verifier, nonce
        
            sessionStorage.setItem('profile', JSON.stringify(profile));
            sendPlausibleEvent({ path: '/profile' });
            showProfile(profile);
        } catch (err) {
            console.error(err)
            sessionStorage.clear();
            showLoginPage();
            processError(params);
        } finally {
            clearFragment();
        }
    }

    async function processIdToken(params) {
        try {
            const token = params.get('id_token');
            if (!token)
                throw new Error('Missing id_token');
            
            const { payload } = parseToken(token);    
            if (!payload)
                throw new Error('Did not get profile from token');
        
            authzJsonResponse = payload
        } catch (err) {
        }
    }

    function removeLoader() {
        document.getElementById('load-spinner')?.remove(); //remove spinner
		document.getElementById('app').style.display = 'flex'; //show content
    }
</script>

<Header/>

<main>
    <section class="flex gap-10 p-4 border m-4">
        <ScopeParam bind:selectedScopes/>
    
        <ProtocolParams
            bind:selectedParams
            bind:selectedParamsValues
        />
    
        <HelloParams
            bind:selectedParams
            bind:selectedParamsValues
        />
    
        <AuthorizationServer/>
    </section>

    <a href="{authzUrl}">authz test</a>
    <a href="{inviteUrl}">invite test</a>

   <AuthorizationUrlResponse {authzUrlResponse}/>
   <AuthorizationJsonResponse {authzJsonResponse}/>

   <InviteRequest {inviteUrl}/>
</main>

<wc-footer/>