<script>
	import { onMount } from 'svelte';
	import { PARAMS, AUTHZ_SERVERS, BETA_SERVER } from '$lib/constants.js';
	import Header from '$components/Header.svelte';
	import AuthorizationRequest from '$components/AuthorizationRequest.svelte';
	import AuthorizationResponse from '$components/AuthorizationResponse.svelte';
	import InviteRequest from '$components/Request/InviteRequest.svelte';
	import FileIssue from '$components/FileIssue.svelte';
	import { init as initShiki } from '$lib/shiki.js';
	import {
		cleanUrl,
		handleLegacyState,
		removeLoader,
		generatePkce,
		sendPlausibleEvent,
		focusAuthzResponseSection
	} from '$lib/utils.js';
	import { makeAuthzUrl, makeInviteUrl } from '$lib/request.js';
	import { parseToken, validateToken } from '@hellocoop/helper-browser';
	import Notification from '$lib/components/Notification.svelte';

	// states
	let selectedScopes = $state(PARAMS.SCOPE_PARAM.DEFAULT_SELECTED);
	let selectedProtocolParams = $state(PARAMS.PROTOCOL_PARAM.DEFAULT_SELECTED);
	let selectedProtocolParamsValues = $state(PARAMS.PROTOCOL_PARAM.DEFAULT_VALUES);
	let selectedHelloParams = $state(PARAMS.HELLO_PARAM.DEFAULT_SELECTED);
	let selectedHelloParamsValues = $state(PARAMS.HELLO_PARAM.DEFAULT_VALUES);
	let selectedAuthzServer = $state(AUTHZ_SERVERS.DEFAULT_SELECTED);
	let customAuthzServer = $state('');
	let customScope = $state('');
	let isHelloMode = $state(true); // this only matters if hello dev flag is set
	let mounted = $state(false);
	let showErrorNotification = $state(false);
	let authzResponse = $state({
		url: null,
		token: null,
		parsed: null, // code flow does not call introspect -- parses locally
		introspect: null, // id_token flow calls introspect
		userinfo: null
	});
	let dropdowns = $state({
		scope: true,
		protocol: false,
		hello: true,
		server: false,
		request: true
	});

	// derived - (re-computed when states change)
	const claims = $derived(
		// id_token flow            // code flow
		authzResponse.introspect || authzResponse.parsed
	);
	const canInvite = $derived(Boolean(claims?.sub && claims?.name && claims?.email));
	const authzUrl = $derived(
		makeAuthzUrl({
			authzServer: selectedAuthzServer,
			customAuthzServer,
			scopes: selectedScopes,
			customScope,
			protocolParams: selectedProtocolParams,
			protocolParamsValues: selectedProtocolParamsValues,
			helloParams: selectedHelloParams,
			helloParamsValues: selectedHelloParamsValues
		})
	);
	const inviteUrl = $derived(
		makeInviteUrl({
			authzServer: selectedAuthzServer,
			claims,
			protocolParamsValues: selectedProtocolParamsValues
		})
	);

	// save state to local storage
	// this runs everytime there is a state change
	$effect(saveStateToLocalStorage);

	onMount(async () => {
		// then fn also generates pkce challenges if it does not exist
		await loadStateFromLocalStorage();

		const { search } = window.location;
		const hash = window.location.hash.substring(1);
		const params = new URLSearchParams(search || hash);
		const iss = params.get('iss');

		if (iss && iss?.startsWith('https://issuer.hello')) await processIssuer(params);

		if (params.has('id_token')) await processIdToken(params);
		else if (params.has('code')) await processCode(params);
		else if (params.has('error')) processError(params);
		else if (params.has('beta')) selectBetaServer();

		cleanUrl();
		removeLoader();
		sendPlausibleEvent();
		await initShiki(); // syntax highlighting

		mounted = true;

		// focus authz response section for better mobile UX
		// runs after 'mounted' to ensure UI is rendered
		if (claims) focusAuthzResponseSection();
	});

	function saveStateToLocalStorage() {
		// avoid overwriting existing state on page load
		// wait for the page to mount and read state from local storage
		if (!mounted) return;

		const states = JSON.stringify({
			scopes: selectedScopes,
			dropdowns,
			server: selectedAuthzServer,
			protocol_params: selectedProtocolParams,
			protocol_params_values: selectedProtocolParamsValues,
			hello_params: selectedHelloParams,
			hello_params_values: selectedHelloParamsValues,
			custom_scope_value: customScope,
			custom_authz_server_value: customAuthzServer
		});
		localStorage.setItem('states', states);
	}

	async function loadStateFromLocalStorage() {
		try {
			const states = JSON.parse(localStorage.getItem('states'));

			// cleanup legacy state
			if ('invite_query_params' in states) return handleLegacyState();

			if (states.scopes) selectedScopes = states.scopes;
			if (states.dropdowns) dropdowns = states.dropdowns;
			if (states.server) selectedAuthzServer = states.server;
			if (states.protocol_params) selectedProtocolParams = states.protocol_params;
			if (states.protocol_params_values)
				selectedProtocolParamsValues = states.protocol_params_values;
			if (states.hello_params) selectedHelloParams = states.hello_params;
			if (states.hello_params_values) selectedHelloParamsValues = states.hello_params_values;
			if (states.custom_scope_value) customScope = states.custom_scope_value;
			if (states.custom_authz_server_value) customAuthzServer = states.custom_authz_server_value;
		} catch (_) {
			// no states
		}

		const pkceChallengeExist =
			selectedProtocolParamsValues.code_challenge && selectedProtocolParamsValues.code_verifier;
		if (!pkceChallengeExist) {
			// pkce flow challenge does not exist -- generate
			const { nonce, code_verifier, code_challenge } = await generatePkce();
			selectedProtocolParamsValues.nonce = nonce;
			selectedProtocolParamsValues.code_verifier = code_verifier;
			selectedProtocolParamsValues.code_challenge = code_challenge;
		}
	}

	async function processIssuer(params = {}) {
		try {
			const iss = params.get('iss');
			if (!iss) throw params;
			const wallet = iss.replace('issuer', 'wallet');
			const authorize = new URL('/authorize', wallet).href;
			selectedAuthzServer = authorize; // save locally to call correct endpoints after iss flow
			const loginHint = params.get('login_hint');
			const domainHint = params.get('domain_hint');
			const url = makeAuthzUrl({
				authzServer: authorize,
				scopes: selectedScopes,

				// this creates a copy
				// we do not want to modify the states & save locally for iss flows
				protocolParams: [...selectedProtocolParams.concat(loginHint ? ['login_hint'] : [])],
				protocolParamsValues: {
					...selectedProtocolParamsValues,
					...(loginHint ? { login_hint: loginHint } : {}) // so we dont pass login_hint: undefined
				},
				helloParams: [...selectedHelloParams.concat(domainHint ? ['domain_hint'] : [])],
				helloParamsValues: {
					...selectedHelloParamsValues,
					...(domainHint ? { domain_hint: domainHint } : {}) // so we dont pass domain_hint: undefined
				}
			});
			return (window.location.href = url);
		} catch (err) {
			console.error(err);
			showErrorNotification = true;
		}
	}

	async function processCode(params = {}) {
		try {
			authzResponse.url = params.toString();

			const code = params.get('code');
			if (!code) throw new Error('Missing code');

			const tokenRes = await fetch(new URL('/oauth/token', selectedAuthzServer), {
				method: 'POST',
				mode: 'cors',
				cache: 'no-cache',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: new URLSearchParams({
					code,
					code_verifier: selectedProtocolParamsValues.code_verifier,
					client_id: selectedProtocolParamsValues.client_id,
					redirect_uri: selectedProtocolParamsValues.redirect_uri,
					nonce: selectedProtocolParamsValues.nonce,
					grant_type: 'authorization_code'
				}).toString()
			});
			const token = await tokenRes.json();
			// this only returns id_token str and not full json response
			// we need access_token to call userinfo endpoint later
			// const token = await fetchToken()
			if (!token) throw new Error('Did not get response from token endpoint');
			authzResponse.token = token;

			const { payload: profile } = parseToken(token.id_token);
			if (!profile) throw new Error('Did not get profile from token');
			authzResponse.parsed = profile;

			const userinfoRes = await fetch(new URL('/oauth/userinfo', selectedAuthzServer), {
				method: 'POST',
				mode: 'cors',
				cache: 'no-cache',
				headers: { Authorization: `Bearer ${token.access_token}` }
			});
			const userinfo = await userinfoRes.json();
			if (!userinfo) throw new Error('Did not get userinfo');
			authzResponse.userinfo = userinfo;
		} catch (err) {
			console.error(err);
			showErrorNotification = true;
		}
	}

	async function processIdToken(params = {}) {
		try {
			authzResponse.url = params.toString();

			const token = params.get('id_token');
			if (!token) throw new Error('Missing id_token');

			const payload = await validateToken({
				token,
				client_id: selectedProtocolParamsValues.client_id,
				nonce: selectedProtocolParamsValues.nonce,

				// because helper-browser adds ''/authorize'
				wallet: selectedAuthzServer.replace('/authorize', '')
			});
			authzResponse.introspect = payload;
		} catch (err) {
			console.error(err);
			showErrorNotification = true;
		}
	}

	function processError(params) {
		authzResponse.url = params.toString();
		showErrorNotification = true;
	}

	function selectBetaServer() {
		selectedAuthzServer = BETA_SERVER;
		dropdowns.server = true; // expand to show selected beta server
	}
</script>

{#if mounted}
	<Header />

	{#if showErrorNotification}
		<Notification close={() => (showErrorNotification = false)} />
	{/if}

	<main class="py-6 px-4 space-y-6 flex-1">
		<AuthorizationRequest
			bind:selectedScopes
			bind:selectedProtocolParams
			bind:selectedProtocolParamsValues
			bind:selectedHelloParams
			bind:selectedHelloParamsValues
			bind:dropdowns
			bind:isHelloMode
			bind:selectedAuthzServer
			bind:customScope
			bind:customAuthzServer
			{authzUrl}
		/>

		<AuthorizationResponse {authzUrl} {authzResponse} />

		<InviteRequest {canInvite} {inviteUrl} />

		<FileIssue />
	</main>

	<wc-footer></wc-footer>
{/if}
