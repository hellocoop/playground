<script>
	import { onMount, tick } from 'svelte';
	import { slide } from 'svelte/transition';
	// import makePKCE from './utils/pkce.js';
	import { createCssVariablesTheme } from 'shiki/core';
	import { createHighlighterCore } from 'shiki';
	import tippy from 'sveltejs-tippy';
	import getWasm from 'shiki/wasm'; //TBD: does not work without importing this
	import Header from './lib/Header.svelte'

	let readFromLocalStorage = false;
	let darkMode = false;
	let highlighter;
	let isHelloMode = false;

	const scopes = {
		standard: [
			'openid',
			'profile',
			'email',
			'phone',
			'picture',
			'name',
			'nickname',
			'given_name',
			'family_name'
		],
		pi_standard: ['preferred_username'],
		custom: ['ethereum', 'discord', 'twitter', 'github', 'gitlab'],
		pi_custom: [
			// "mastodon",
			// "instagram",
			// "bio",
			// "banner",
			'recovery',
			'verified_name',
			'existing_name',
			'existing_username'
		],
		required: ['openid']
	};
	scopes.claims = [
		'sub',
		...scopes.standard,
		...scopes.pi_standard,
		...scopes.custom,
		...scopes.pi_custom
	];

	const possibleSlugs = [
		'apple',
		'google',
		'discord',
		'facebook',
		'github',
		'gitlab',
		'twitch',
		'twitter',
		'tumblr',
		'mastodon',
		'microsoft',
		'line',
		'wordpress',
		'yahoo',
		'zoho',
		'email',
		'ethereum',
		'qrcode',
		'passkey'
	];
	const pi_possibleSlugs = [];

	let invalidProviderHintSlug = null;
	let debounceTimer;

	$: {
		//show error if invalid provider_hint
		if ('provider_hint' in states.query_param_values) {
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				const providerHintsArr = states.query_param_values?.provider_hint?.split(' ');
				const invalidSlugs = providerHintsArr
					.map((i) => i.replace('--', ''))
					.filter(
						(i) => ![...possibleSlugs, ...(isHelloMode ? pi_possibleSlugs : [])].includes(i) && i
					);

				if (invalidSlugs?.length) {
					invalidProviderHintSlug = Array.from(invalidSlugs);
				} else {
					invalidProviderHintSlug = null;
				}
			}, 250);
		}
	}

	onMount(async () => {
		if (!getStatesFromLocalStorage()) {
			//states not found in local storage, save default states to local storage
			const _states = JSON.stringify(states);
			localStorage.setItem('states', _states);
		}
		isHelloMode = !!localStorage.plausible_ignore;
		readFromLocalStorage = true;

		processFragmentOrQuery();
		sendPlausibleEvent();

		if (
			!['https://wallet.hello.coop/authorize', ...states.custom_authorization_servers].includes(
				states.selected_authorization_server
			)
		) {
			custom_authorization_server = states.selected_authorization_server;
		}

		const theme = createCssVariablesTheme({
			name: 'css-variables',
			variablePrefix: '--shiki-',
			variableDefaults: {},
			fontStyle: true
		});

		highlighter = await createHighlighterCore({
			themes: [theme],
			langs: [import('shiki/langs/json.mjs'), import('shiki/langs/http.mjs')],
			loadWasm: getWasm //TBD: does not work without importing this
		});

		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			darkMode = true;
		}
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
			if (event.matches) {
				darkMode = true;
			} else {
				darkMode = false;
			}
		});

		document.getElementById('load-spinner')?.remove(); //remove spinner
		document.getElementById('app').style.display = 'flex'; //show content
	});
	
	const clientIds = {
		playground: 'app_HelloDeveloperPlayground_Iq2',
		playground_old: '46be57a7-d0f5-459e-9655-24799433637d',
		greenfield: 'app_GreenfieldFitnessDemoApp_s9z'
	};

	const betaAuthzServer = 'https://wallet.hello-beta.net/authorize';

	// const updateScopes = ['name', 'email', 'picture', 'phone', 'profile'];

	let errorNotification = null;

	const queryParams = {
		params: {
			provider_hint: '',
			domain_hint: '',
			custom: ''
		},
		pi_params: {
			passkeys: 'global'
		},
		required: []
	};
	const protocolParams = {
		params: {
			client_id: '',
			nonce: '',
			redirect_uri: '',
			response_type: ['code', 'id_token'],
			code_challenge: '',
			code_verifier: '',
			response_mode: ['fragment', 'query'],
			state: '',
			prompt: ['consent', 'login'],
			login_hint: '',
			scope: ''
		},
		required: ['client_id', 'redirect_uri', 'nonce', 'response_type']
	};
	const protocolParamsPlaceholders = {
		login_hint: 'name@example.com'
	};

	const inviteQueryParams = {
		params: {
			inviter: '',
			client_id: '',
			initiate_login_uri: '',
			events_uri: '',
			localhost_invite: false,
			return_uri: '',
			app_name: '',
			role: '',
			prompt: '',
			state: '',
			tenant: '',
			manage: false
		},
		required: ['client_id', 'initiate_login_uri', 'return_uri']
	};

	let custom_authorization_server = '';

	const result = {
		authorize: null,
		introspect: null,
		userinfo: null,
		token: null
	};

	//this is so we can reset query params to original state
	const defaultQueryParamStates = {
		query_params: [],
		protocol_params: ['client_id', 'redirect_uri', 'nonce', 'response_type'],
		invite_query_params: ['inviter', 'client_id', 'initiate_login_uri', 'return_uri'],
		invite_playground_query_params: ['inviter', 'client_id', 'initiate_login_uri', 'return_uri'],
		query_param_values: {
			...queryParams.params
		},
		protocol_param_values: {
			...protocolParams.params,
			client_id: clientIds.playground,
			nonce: makeNonce(),
			redirect_uri: window.location.origin + '/',
			response_mode: 'fragment',
			response_type: 'id_token',
			prompt: ['consent'],
			passkeys: 'global'
		},
		dropdowns: {
			scopeParam: true,
			queryParams: true,
			protocolParams: false,
			authzServer: false,
			requestURL: true
		}
	};

	//default states
	const defaultStates = {
		selected_authorization_server: 'https://wallet.hello.coop/authorize',
		custom_authorization_servers: [betaAuthzServer],
		scopes: ['openid', 'profile'],
		custom_scope: '',
		...defaultQueryParamStates,
		invite_query_param_values: {
			...inviteQueryParams.params,
			client_id: clientIds.playground,
			initiate_login_uri: 'https://playground.hello.dev/',
			return_uri: 'https://playground.hello.dev/'
		},
		invite_playground_query_param_values: {
			...inviteQueryParams.params,
			client_id: clientIds.playground,
			initiate_login_uri: 'https://playground.hello.dev/',
			return_uri: 'https://playground.hello.dev/'
		}
	};

	//binds to user input
	let states = {
		...defaultStates
	};

	let mobileMenu = false;

	const copyTooltip = {
		requestURL: false,
		inviteURL: false,
		invitePlaygroundURL: false,
		authorize: false,
		introspect: false,
		userinfo: false,
		token: false
	};

	$: dropdown = {
		authorize: result.authorize !== null ? true : false,
		token: result.token !== null ? true : false,
		userinfo: result.userinfo !== null ? true : false,
		introspect: result.introspect !== null ? true : false,
		claims: result.introspect !== null ? true : false
	};

	//detect chanes in state -> save to local storage
	$: states, saveStatesToLocalStorage();

	async function processFragmentOrQuery() {
		if (!window.location.hash && !window.location.search) return;

		const isBetaMode = window.location.hash.includes('beta');
		if (isBetaMode) {
			states.custom_authorization_servers = [
				...new Set([...states.custom_authorization_servers, betaAuthzServer])
			];
			states.selected_authorization_server = betaAuthzServer;
			states.dropdowns.authzServer = true;
		}

		let protocolParams;
		if (window.location.hash && !isBetaMode) {
			protocolParams = new URLSearchParams(window.location.hash.substring(1));
			result.authorize = window.location.hash;
		} else if (window.location.search) {
			protocolParams = new URLSearchParams(window.location.search);
			result.authorize = window.location.search;
		}

		cleanURL();

		const id_token = protocolParams.get('id_token');
		const loginHint = protocolParams.get('login_hint');
		const domainHint = protocolParams.get('domain_hint');
		const code = protocolParams.get('code');
		const initiate_login = protocolParams.get('initiate-login');
		const iss = protocolParams.get('iss');
		const error = protocolParams.get('error');
		if (error) {
			errorNotification = error?.replaceAll('_', ' ');
			//tbd show error description?
		}
		if (iss && iss.startsWith('https://issuer.hello')) {
			const wallet = iss.replace('issuer', 'wallet');
			const authorization_endpoint = new URL('/authorize', wallet).href;

			//reset all params and settings
			resetAll();

			//add issuer authz endpoint to existing authz servers
			states.custom_authorization_servers = [
				...new Set([...states.custom_authorization_servers, authorization_endpoint.toLowerCase()]) //dedupe
			];
			states.selected_authorization_server = authorization_endpoint;

			let _requestUrl = makeRequestURL({
				server: authorization_endpoint,
				scopes: states.scopes,
				queryParams: states.query_params,
				queryParamValues: states.query_param_values,
				protocolParams: states.protocol_params,
				protocolParamValues: states.protocol_param_values,
				type: 'request'
			});
			if (loginHint) {
				_requestUrl += '&login_hint=' + loginHint;
			}
			if (domainHint) {
				_requestUrl += '&domain_hint=' + domainHint;
			}
			window.location.href = _requestUrl;
		}
		if (initiate_login) {
			await tick(); //wait for requestURL to compute
			const url = new URL(initiate_login);
			const existingSearchParams = new URL(requestURL).search;
			if (existingSearchParams) {
				url.search = existingSearchParams;
			}
			if (loginHint) {
				url.searchParams.set('login_hint', loginHint);
			}
			if (domainHint) {
				url.searchParams.set('domain_hint', domainHint);
			}
			window.location.href = url.href;
		}
		if (code) {
			try {
				const res = await getToken(code);
				result.token = res;
			} catch (err) {
				result.token = err;
			}
			if (result.token.access_token) {
				try {
					const res = await getUserInfo(result.token.access_token);
					result.userinfo = res;
				} catch (err) {
					result.userinfo = err;
				}
			}
		}
		if (id_token || result.token?.id_token) {
			try {
				const payload = await getIntrospect(id_token || result.token.id_token);
				result.introspect = payload;

				//set inviter to sub
				if (result.introspect.sub) {
					states.invite_query_param_values.inviter = result.introspect.sub;
					states.invite_playground_query_param_values.inviter = result.introspect.sub;
				}
			} catch (err) {
				result.introspect = err;
			}
		}
	}

	function cleanURL() {
		if (window.location.search) {
			window.history.replaceState({}, document.title, '/');
		} else {
			window.location.replace('#');
			// slice off the remaining '#' in HTML5:
			if (typeof window.history.replaceState == 'function') {
				history.replaceState({}, '', window.location.href.slice(0, -1));
			}
		}
	}

	async function getUserInfo(token) {
		const userInfoEndpoint = new URL('/oauth/userinfo', states.selected_authorization_server);
		const options = {
			headers: { Authorization: `Bearer ${token}` },
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache'
		};
		try {
			const res = await fetch(userInfoEndpoint, options);
			const json = await res.json();
			return json;
		} catch (err) {
			return err;
		}
	}

	async function getToken(code) {
		const params = {
			code,
			client_id: states.protocol_param_values.client_id,
			redirect_uri: states.protocol_param_values.redirect_uri,
			grant_type: 'authorization_code',
			code_verifier: states.protocol_param_values.code_verifier
		};
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams(params).toString()
		};
		const tokenEndpoint = new URL('/oauth/token', states.selected_authorization_server);
		const res = await fetch(tokenEndpoint, options);
		const json = await res.json();
		if (res.status !== 200 || !res.ok) throw json;
		return json;
	}

	async function getIntrospect(id_token) {
		const introspectEndpoint = new URL('/oauth/introspect', states.selected_authorization_server);
		const params = {
			client_id: states.protocol_param_values.client_id,
			nonce: states.protocol_param_values.nonce,
			token: id_token
		};
		const options = {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			headers: { 'Content-type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams(params).toString()
		};
		try {
			const res = await fetch(introspectEndpoint, options);
			const json = await res.json();
			return json;
		} catch (err) {
			console.error(err);
		} finally {
			window.location.replace('#');
			// slice off the remaining '#' in HTML5:
			if (typeof window.history.replaceState == 'function') {
				history.replaceState({}, '', window.location.href.slice(0, -1));
			}
		}
	}

	function makeNonce() {
		const nonce = crypto
			.getRandomValues(new Uint32Array(2))
			.reduce((a, b) => b.toString() + a.toString());
		return nonce;
	}

	function compareKeys(a, b) {
		var aKeys = Object.keys(a).sort();
		var bKeys = Object.keys(b).sort();
		return JSON.stringify(aKeys) === JSON.stringify(bKeys);
	}

	function getStatesFromLocalStorage() {
		if (!localStorage.states) return false;

		try {
			const _states = JSON.parse(localStorage.getItem('states'));
			if (!compareKeys(states, _states)) {
				console.info('State keys do not match, clearing localStorage');
				localStorage.removeItem('states');
				return false;
			}
			states = _states;
			return true;
		} catch (err) {
			console.error(err);
			localStorage.removeItem('states');
		}
	}

	function saveStatesToLocalStorage() {
		if (!readFromLocalStorage) {
			//only update states in localStorage after reading from it on onMount
			//if not, states gets reset on every page load (we need to update on existing localstorage state)
			return;
		}

		const _states = JSON.stringify(states);
		localStorage.setItem('states', _states);
	}

	function makeRequestURL({
		server,
		scopes,
		queryParams,
		queryParamValues,
		protocolParams,
		protocolParamValues,
		type
	} = {}) {
		try {
			const url = new URL(server);
			if (type === 'invite') {
				url.pathname = 'invite';
			}
			//not overriding existing scopes
			if (scopes?.length && !states.protocol_params.includes('scope')) {
				const _scopes = scopes.join(' '); //array of scopes to string separated by space
				url.searchParams.set('scope', _scopes);
			}
			if (queryParams?.length) {
				for (const param of queryParams) {
					if (param === 'custom' && type == 'request') {
						const custom = new URLSearchParams(queryParamValues[param]);
						for (const [key, value] of custom) {
							url.searchParams.set(key, value);
						}
						continue;
					}
					const query_param_value = queryParamValues[param];
					if (query_param_value) {
						url.searchParams.set(param, query_param_value);
					}
				}
			}
			if (protocolParams?.length) {
				for (const param of protocolParams) {
					const protocol_param_value = protocolParamValues[param];
					const isArray = Array.isArray(protocol_param_value);
					if (isArray ? protocol_param_value.length : protocol_param_value) {
						url.searchParams.set(
							param,
							isArray ? protocol_param_value.join(' ') : protocol_param_value
						);
					}
					//boolean states
					if (type == 'invite' && (param == 'manage' || param == 'localhost_invite')) {
						url.searchParams.set(param, 'true');
					}
				}
			}
			const lineBreakedURL = url.toString().replace(/&/g, '\n&').replace(/\?/g, '\n?');
			return lineBreakedURL;
		} catch (err) {
			return 'Invalid URL';
		}
	}

	let continueWithHelloAjax = false;
	async function continueWithHello() {
		try {
			continueWithHelloAjax = true;
			let url;
			if (custom_authorization_server.length) {
				url = new URL(custom_authorization_server);
			}
			states.custom_authorization_servers = [
				...new Set([...states.custom_authorization_servers, url.href.toLowerCase()]) //dedupe
			];
			states.selected_authorization_server = url.href;
			custom_authorization_server = '';
		} catch {
			// console.error('Custom auth server endpoint not saved locally: Invalid URL')
		} finally {
			window.location.href = requestURL;
		}
	}

	let invitePlaygroundWithHelloAjax = false;
	function invitePlaygroundWithHello() {
		invitePlaygroundWithHelloAjax = true;
		window.location.href = invitePlaygroundURL;
	}

	// let inviteWithHelloAjax = false;
	// async function inviteWithHello() {
	// 	try {
	// 		inviteWithHelloAjax = true;
	// 		let url;
	// 		if (custom_authorization_server.length) {
	// 			url = new URL(custom_authorization_server);
	// 		}
	// 		if (
	// 			!['https://wallet.hello.coop/authorize', ...states.custom_authorization_servers].includes(
	// 				url.href
	// 			)
	// 		) {
	// 			states.custom_authorization_servers = [...states.custom_authorization_servers, url.href];
	// 			states.selected_authorization_server = url.href;
	// 			custom_authorization_server = '';
	// 		}
	// 	} catch {
	// 		// console.error('Custom auth server endpoint not saved locally: Invalid URL')
	// 	} finally {
	// 		window.location.href = inviteURL;
	// 	}
	// }

	async function copy(state, content) {
		copyTooltip[state] = true;
		await navigator.clipboard.writeText(content);
		setTimeout(() => {
			copyTooltip[state] = false;
		}, 500);
	}

	async function handleCheckboxInput(e, param) {
		if (param === 'nonce') {
			if (e.target.checked) {
				states.protocol_param_values.nonce = makeNonce();
			} else {
				states.protocol_param_values.nonce = '';
			}
		}

		if (param === 'code_challenge') {
			if (e.target.checked) {
				// const { code_challenge, code_verifier } = await makePKCE();
				// states.protocol_param_values.code_challenge = code_challenge;
				// states.protocol_param_values.code_verifier = code_verifier;
			} else {
				states.protocol_param_values.code_challenge = states.protocol_param_values.code_verifier =
					'';
			}
		}

		if (param === 'response_mode') {
			if (!e.target.checked) {
				states.protocol_param_values.response_mode = 'fragment';
			}
		}
	}

	$: requestURL = makeRequestURL({
		server: states.selected_authorization_server,
		scopes: states.scopes,
		queryParams: states.query_params,
		queryParamValues: states.query_param_values,
		protocolParams: states.protocol_params,
		protocolParamValues: states.protocol_param_values,
		type: 'request'
	});

	$: inviteURL = makeRequestURL({
		server: states.selected_authorization_server,
		scopes: [],
		protocolParams: states.invite_query_params,
		protocolParamValues: states.invite_query_param_values,
		type: 'invite'
	});

	$: invitePlaygroundURL = makeRequestURL({
		server: states.selected_authorization_server,
		scopes: [],
		protocolParams: states.invite_playground_query_params,
		protocolParamValues: states.invite_playground_query_param_values,
		type: 'invite'
	});

	async function sendPlausibleEvent() {
		if (isHelloMode || import.meta.env.DEV) {
			console.info('Ignoring Event: localStorage flag');
			return;
		}
		const _body = {
			w: window.innerWidth,
			d: 'playground.hello.dev',
			n: 'pageview',
			r: document.referrer || null,
			u: new URL('https://playground.hello.dev/')
		};
		try {
			await fetch('/api/event', {
				method: 'POST',
				body: JSON.stringify(_body)
			});
			console.info(`Event sent: ${_body.u} (${_body.n})`);
		} catch (err) {
			console.error(err);
		}
	}

	const resetAll = () => {
		localStorage.removeItem('states');
		states = { ...defaultStates };
	};

	$: canInvite =
		states.invite_playground_query_param_values.inviter &&
		result.introspect?.name &&
		result.introspect?.email;

	const highlight = (lang, content) => {
		if (!highlighter) return '...';
		const html = highlighter.codeToHtml(content, {
			lang,
			theme: 'css-variables'
		});
		return html;
	};
</script>

<svelte:window
	on:keypress={(e) => {
		if (e.key === 'Enter') {
			continueWithHello();
		}
	}}
/>

<Header/>

{#if errorNotification}
	<div class="bg-red-500 p-2.5 text-center text-white flex items-center justify-center" out:slide>
		<span class="text-sm">{errorNotification}</span>
		<button class="absolute right-4" on:click={() => (errorNotification = null)}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				class="w-5 h-5"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>
{/if}

{#if highlighter}
	<main class="flex-1 overflow-y-auto">
		<div class="py-6 px-4 space-y-6">
			<section
				class="relative border border-charcoal dark:border-gray-800 rounded-sm w-full px-4 pb-4 pt-6"
			>
				<span class="absolute -mt-9 bg-white dark:bg-[#151515] px-2 -mx-2"
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
				<button
					on:click={resetAll}
					class="absolute -top-3 right-1 px-3 rounded-xl border border-charcoal dark:border-gray-800 text-sm bg-white dark:bg-[#151515]"
					>Reset</button
				>

				<div class="columns-1 md:columns-2 xl:columns-3 4xl:columns-4 gap-x-12 space-y-6">
					<!-- Scope Param -->
					<div
						class="break-inside-avoid-column"
						class:opacity-50={states.protocol_params.includes('scope')}
						class:pointer-events-none={states.protocol_params.includes('scope')}
					>
						<div class="inline-flex items-center space-x-2">
							<div class="space-x-6 inline-flex justify-between items-center">
								<button
									class="inline-flex items-center space-x-2"
									on:click={() => (states.dropdowns.scopeParam = !states.dropdowns.scopeParam)}
								>
									<h1 class="font-semibold text-lg inline-block">Scope Parameter</h1>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="3"
										stroke="currentColor"
										class="w-4 h-4"
										class:rotate-180={states.dropdowns.scopeParam}
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="m19.5 8.25-7.5 7.5-7.5-7.5"
										/>
									</svg>
								</button>
							</div>
							<a
								use:tippy={{ content: 'Scope Parameter Docs', placement: 'top' }}
								href="https://www.hello.dev/docs/scopes/"
								target="_blank"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									style="height: 1.1rem"
								>
									<path
										fill-rule="evenodd"
										d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
										clip-rule="evenodd"
									/>
								</svg>
							</a>
						</div>

						{#if states.dropdowns.scopeParam}
							<div class="mt-2" transition:slide|local>
								<div class="flex gap-x-4 pl-1">
									<ul class="space-y-2 mt-2 w-44">
										{#each scopes.standard.concat(isHelloMode ? scopes.pi_standard : []) as scope}
											{@const required = scopes.required.includes(scope)}
											<li
												class="flex items-center"
												class:text-red-500={required && !states.scopes.includes(scope)}
											>
												<input
													type="checkbox"
													class="text-charcoal form-checkbox dark:text-gray-800"
													name={scope}
													id={scope}
													value={scope}
													bind:group={states.scopes}
												/>
												<label for={scope} class="ml-2"
													>{scope}
													{required ? '*' : ''}</label
												>
											</li>
										{/each}
									</ul>
									<ul class="space-y-2 mt-2 truncate">
										{#each scopes.custom.concat(isHelloMode ? scopes.pi_custom : []) as scope}
											<li class="flex items-center truncate pl-1">
												<input
													type="checkbox"
													class="text-charcoal form-checkbox dark:text-gray-800"
													name={scope}
													id={scope}
													value={scope}
													bind:group={states.scopes}
												/>
												<label for={scope} class="ml-2 truncate italic">{scope}</label>
											</li>
										{/each}

										<li class="flex items-center pl-1 pb-2">
											<input
												type="checkbox"
												bind:group={states.scopes}
												value={states.custom_scope}
												class="text-charcoal form-checkbox dark:text-gray-800"
											/>
											<input
												type="text"
												class="h-6 px-2 ml-2 w-24 mr-10 form-input italic"
												autocomplete="none"
												autocorrect="off"
												autocapitalize="off"
												spellcheck="false"
												bind:value={states.custom_scope}
											/>
										</li>
									</ul>
								</div>
							</div>
						{/if}
					</div>

					<!-- Protocol Params -->
					<div class="break-inside-avoid-column">
						<div class="inline-flex items-center space-x-2">
							<button
								class="inline-flex items-center space-x-2"
								on:click={() =>
									(states.dropdowns.protocolParams = !states.dropdowns.protocolParams)}
							>
								<h1 class="font-semibold text-lg inline-block">Protocol Parameters</h1>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="3"
									stroke="currentColor"
									class="w-4 h-4"
									class:rotate-180={states.dropdowns.protocolParams}
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="m19.5 8.25-7.5 7.5-7.5-7.5"
									/>
								</svg>
							</button>
							<!-- <a
								use:tippy={{ content: 'Protocol Parameters Docs', placement: 'top' }}
								href="https://www.hello.dev/docs/oidc/request/#openid-connect-parameters"
								target="_blank"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									style="height: 1.1rem"
								>
									<path
										fill-rule="evenodd"
										d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
										clip-rule="evenodd"
									/>
								</svg>
							</a> -->
						</div>

						{#if states.dropdowns.protocolParams}
							<ul class="space-y-2 mt-2" transition:slide|local>
								{#each Object.entries( { ...protocolParams.params, ...(isHelloMode ? protocolParams.pi_params : {}) } ) as [param, value]}
									{@const required = protocolParams.required.includes(param)}
									<li class="flex items-center relative">
										<div class="w-1/2 md:w-1/4 flex-shrink-0 md:min-w-[10rem] flex items-center">
											{#if param !== 'code_verifier'}
												<input
													type="checkbox"
													bind:group={states.protocol_params}
													on:change={(e) => handleCheckboxInput(e, param)}
													class="text-charcoal form-checkbox dark:text-gray-800"
													name={param}
													id={param}
													value={param}
												/>
											{:else}
												<span class="w-4" />
											{/if}
											<label
												for={param}
												class="ml-2"
												class:text-red-500={//required
												(required &&
													(!states.protocol_params.includes(param) ||
														//if checked and empty field
														!states.protocol_param_values[param])) ||
													//response_type: code but not code_challenge unchecked
													(param === 'code_challenge' &&
														states.protocol_param_values.response_type === 'code' &&
														!states.protocol_params.includes('code_challenge')) ||
													//response_type: id_token and response_mode: query
													(param === 'response_mode' &&
														states.protocol_params.includes('response_mode') &&
														states.protocol_param_values.response_mode === 'query' &&
														states.protocol_params.includes('response_type') &&
														states.protocol_param_values.response_type === 'id_token') ||
													//login_hint and domain_hint can both be provided if domain_hint is not a domain (IE it is personal or managed)
													//if both domain_hint and login_hint are checked (only one is valid at a time)
													(param === 'login_hint' &&
														states.protocol_params.includes('login_hint') &&
														states.query_params.includes('domain_hint') &&
														!['personal', 'managed'].includes(
															states.query_param_values.domain_hint
														))}
											>
												{param}
												{required ? '*' : ''}
											</label>
										</div>

										<div class="w-1/2 md:w-3/4">
											<!-- checkbox -->
											{#if param === 'prompt'}
												<div
													class="xl:h-9 p-1 space-y-1 xl:space-y-0 xl:space-x-1 w-full ring-1 ring-charcoal dark:ring-gray-800 flex flex-col xl:flex-row items-center rounded-sm"
													class:opacity-60={!states.protocol_params.includes(param) &&
														param !== 'response_mode'}
												>
													{#each value as ele}
														<div class="h-full w-full flex items-center justify-center">
															<input
																type="checkbox"
																id={ele}
																class="peer hidden"
																value={ele}
																bind:group={states.protocol_param_values[param]}
															/>
															<label
																for={ele}
																class="leading-[27px] text-charcoal dark:text-[#d4d4d4] peer-checked:text-white peer-checked:dark:text-[#d4d4d4] peer-checked:bg-charcoal text-center cursor-pointer select-none w-full h-full peer-checked:ring-1 ring-charcoal dark:ring-gray-800"
																>{ele}</label
															>
														</div>
													{/each}
												</div>
											{:else if Array.isArray(value)}
												<!-- radio -->
												<div
													class="xl:h-9 p-1 space-y-0.5 xl:space-y-0 xl:space-x-1 w-full ring-1 ring-charcoal dark:ring-gray-800 flex flex-col xl:flex-row items-center rounded-sm"
													class:opacity-60={(!states.protocol_params.includes(param) &&
														param !== 'response_mode') ||
														(param === 'response_mode' &&
															!states.protocol_params.includes('response_mode'))}
												>
													{#each value as ele}
														<div class="h-full w-full flex items-center justify-center">
															<input
																type="radio"
																id={ele}
																class="peer hidden"
																value={ele}
																bind:group={states.protocol_param_values[param]}
															/>
															<label
																for={ele}
																class="leading-[27px] text-charcoal dark:text-[#d4d4d4] peer-checked:text-white peer-checked:dark:text-[#d4d4d4] peer-checked:bg-charcoal text-center cursor-pointer select-none w-full h-full peer-checked:ring-1 ring-charcoal dark:ring-gray-800"
																>{ele}</label
															>
														</div>
													{/each}
												</div>
											{:else}
												<!-- text input -->
												<div
													class="flex flex-col w-full items-start"
													class:opacity-60={!states.protocol_params.includes(param) &&
														param !== 'code_challenge'}
												>
													<input
														type="text"
														placeholder={protocolParamsPlaceholders[param]}
														name={param}
														class="h-6 px-2 w-full form-input"
														autocomplete={param === 'login_hint' ? 'email' : 'none'}
														autocorrect="off"
														autocapitalize="off"
														spellcheck="false"
														bind:value={states.protocol_param_values[param]}
													/>
												</div>
											{/if}
										</div>
									</li>
								{/each}
							</ul>
						{/if}
					</div>

					<br />

					<!-- Query Params -->
					<div class="break-inside-avoid-column">
						<div class="inline-flex items-center space-x-2">
							<button
								class="inline-flex items-center space-x-2"
								on:click={() => (states.dropdowns.queryParams = !states.dropdowns.queryParams)}
							>
								<h1 class="font-semibold text-lg inline-block">Hellō Parameters</h1>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="3"
									stroke="currentColor"
									class="w-4 h-4"
									class:rotate-180={states.dropdowns.queryParams}
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="m19.5 8.25-7.5 7.5-7.5-7.5"
									/>
								</svg>
							</button>
							<!-- <a
								use:tippy={{ content: 'Hellō Parameters Docs', placement: 'top' }}
								href="https://www.hello.dev/docs/oidc/request/#hellō-parameters"
								target="_blank"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									style="height: 1.1rem"
								>
									<path
										fill-rule="evenodd"
										d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
										clip-rule="evenodd"
									/>
								</svg>
							</a> -->
						</div>
						{#if states.dropdowns.queryParams}
							<ul class="space-y-2 mt-2" transition:slide|local>
								{#each Object.entries( { ...queryParams.params, ...(isHelloMode ? queryParams.pi_params : {}) } ) as [param, value]}
									{@const required = queryParams.required.includes(param)}
									{#if param === 'custom'}
										<!-- <span class="pt-0.5 block" /> -->
									{/if}
									<li
										class="flex {['provider_hint', 'domain_hint'].includes(param)
											? 'items-start'
											: 'items-center'} {param === 'custom'
											? 'pt-4 border-t border-charcoal/30 dark:border-white/20'
											: ''} relative"
										class:pb-2={param === 'custom'}
										class:pt-2={param === 'provider_hint'}
									>
										<div
											class="w-1/2 md:w-1/4 flex-shrink-0 md:min-w-[10rem] flex items-center"
											class:mt-6={param === 'client_id'}
										>
											<input
												type="checkbox"
												bind:group={states.query_params}
												on:change={(e) => handleCheckboxInput(e, param)}
												class="text-charcoal form-checkbox dark:text-gray-800"
												name={param}
												id={param}
												value={param}
											/>
											<label
												for={param}
												class="ml-2"
												class:text-red-500={//required
												(required &&
													(!states.query_params.includes(param) ||
														//if checked and empty field
														!states.query_param_values[param])) ||
													//response_type: code but not code_challenge unchecked
													(param === 'code_challenge' &&
														states.query_param_values.response_type === 'code' &&
														!states.query_params.includes('code_challenge')) ||
													//response_type: id_token and response_mode: query
													(param === 'response_mode' &&
														states.query_params.includes('response_mode') &&
														states.query_param_values.response_mode === 'query' &&
														states.query_params.includes('response_type') &&
														states.query_param_values.response_type === 'id_token') ||
													//login_hint and domain_hint can both be provided if domain_hint is not a domain (IE it is personal or managed)
													//if both domain_hint and login_hint are checked (only one is valid at a time)
													(param === 'domain_hint' &&
														states.query_params.includes('domain_hint') &&
														states.protocol_params.includes('login_hint') &&
														!['personal', 'managed'].includes(
															states.query_param_values.domain_hint
														))}
											>
												{param}
												{required ? '*' : ''}
											</label>
										</div>

										<div class="w-1/2 md:w-3/4">
											{#if Array.isArray(value)}
												<div
													class="xl:h-9 p-1 space-y-0.5 xl:space-y-0 xl:space-x-1 w-full ring-1 ring-charcoal dark:ring-gray-800 flex flex-col xl:flex-row items-center rounded-sm"
													class:opacity-60={!states.query_params.includes(param) &&
														param !== 'response_mode'}
												>
													{#each value as ele}
														<div class="h-full w-full flex items-center justify-center">
															<input
																type="radio"
																id={ele}
																class="peer hidden"
																value={ele}
																bind:group={states.query_param_values[param]}
															/>
															<label
																for={ele}
																class="leading-[27px] text-charcoal dark:text-[#d4d4d4] peer-checked:text-white peer-checked:dark:text-[#d4d4d4] peer-checked:bg-charcoal text-center cursor-pointer select-none w-full h-full peer-checked:ring-1 ring-charcoal dark:ring-gray-800"
																>{ele}</label
															>
														</div>
													{/each}
												</div>
											{:else}
												<div
													class="flex flex-col w-full items-start"
													class:opacity-60={!states.query_params.includes(param) &&
														param !== 'code_challenge'}
												>
													<input
														type="text"
														name={param}
														class="h-6 px-2 w-full form-input"
														autocomplete="none"
														autocorrect="off"
														autocapitalize="off"
														spellcheck="false"
														bind:value={states.query_param_values[param]}
													/>
												</div>

												{#if param === 'provider_hint'}
													{#if Array.isArray(invalidProviderHintSlug)}
														<p class="text-xs mt-1.5 text-red-500" transition:slide|local>
															{#if invalidProviderHintSlug.length > 1}
																{invalidProviderHintSlug.join(', ')} are unsupported values
															{:else}
																{invalidProviderHintSlug} is an unsupported value
															{/if}
														</p>
													{/if}
													<p class="text-xs mt-1.5">
														<span class="opacity-80"
															>{possibleSlugs
																.concat(isHelloMode ? pi_possibleSlugs : [])
																.filter((i) => !['google', 'email', 'passkey'].includes(i))
																.join(' ')}</span
														><br />
														<span class="opacity-80"
															>apple-- microsoft-- google-- email-- passkey--</span
														>
													</p>
												{:else if param === 'domain_hint'}
													<p class="text-xs mt-1.5 opacity-80">
														personal | managed | domain.example
													</p>
												{/if}
											{/if}
										</div>
									</li>
								{/each}
							</ul>
						{/if}
					</div>

					<!-- Authorization Server -->
					<div class="break-inside-avoid-column">
						<button
							class="inline-flex items-center space-x-2"
							on:click={() => (states.dropdowns.authzServer = !states.dropdowns.authzServer)}
						>
							<h1 class="font-semibold text-lg">Authorization Server</h1>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="3"
								stroke="currentColor"
								class="w-4 h-4"
								class:rotate-180={states.dropdowns.authzServer}
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="m19.5 8.25-7.5 7.5-7.5-7.5"
								/>
							</svg>
						</button>

						{#if states.dropdowns.authzServer}
							<ul class="space-y-2 mt-2" transition:slide|local>
								<li class="flex items-center">
									<input
										type="radio"
										name="authorization_server"
										value="https://wallet.hello.coop/authorize"
										id="wallet/authorize"
										class="text-charcoal form-radio dark:text-gray-800"
										bind:group={states.selected_authorization_server}
									/>
									<label for="wallet/authorize" class="ml-2 w-full">
										https://wallet.hello.coop/authorize
									</label>
								</li>
								{#each states.custom_authorization_servers as server}
									<li class="flex items-center">
										<input
											type="radio"
											name="authorization_server"
											value={server}
											id={server}
											class="text-charcoal form-radio dark:text-gray-800"
											bind:group={states.selected_authorization_server}
										/>
										<label for={server} class="ml-2 w-full break-all">{server}</label>
									</li>
								{/each}
								<li class="flex items-center">
									<input
										type="radio"
										name="authorization_server"
										value={custom_authorization_server}
										class="text-charcoal form-radio dark:text-gray-800"
										id="custom-authorization-server"
										bind:group={states.selected_authorization_server}
									/>
									<input
										bind:value={custom_authorization_server}
										on:input={(e) => (states.selected_authorization_server = e.target.value)}
										type="url"
										name="custom"
										class="h-8 ml-2 w-full text-charcoal form-input"
										placeholder="eg http://example.com:9000/"
									/>
								</li>
							</ul>
						{/if}
					</div>

					<!-- Request URL -->
					<div class="break-inside-avoid-column">
						<div class="flex items-center">
							<button
								class="inline-flex items-center space-x-2"
								on:click={() => (states.dropdowns.requestURL = !states.dropdowns.requestURL)}
							>
								<h1 class="font-semibold text-lg">Request URL</h1>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="3"
									stroke="currentColor"
									class="w-4 h-4"
									class:rotate-180={states.dropdowns.requestURL}
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="m19.5 8.25-7.5 7.5-7.5-7.5"
									/>
								</svg>
							</button>
						</div>
						{#if states.dropdowns.requestURL}
							<div class="relative">
								<!-- <button
									on:click={() => copy('requestURL', requestURL)}
									class="absolute z-50 right-2.5 top-2.5 w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-charcoal border border-[#808080] shadow-xl"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 stroke hover:stroke-2"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
										/>
									</svg>
								</button> -->
								<div
									class="bg-[#F2F6FB] dark:bg-charcoal rounded-sm p-4 break-words mt-2 relative overflow-x-auto"
									transition:slide|local
								>
									<span
										class="url-container block text-sm whitespace-pre-line"
										class:flash={copyTooltip.requestURL}
									>
										{@html highlight('http', requestURL)}
									</span>
								</div>
							</div>
						{/if}

						<button
							on:click={continueWithHello}
							class="hello-btn-black-and-static w-full flex mt-4"
							class:hello-btn-loader={continueWithHelloAjax}
							disabled={continueWithHelloAjax}
							class:hello-btn-hover-flare={darkMode}>ō&nbsp;&nbsp;&nbsp;Continue with Hellō</button
						>
					</div>
				</div>
			</section>

			<section
				class="relative w-auto border border-charcoal px-4 pb-4 pt-6 dark:border-gray-800 {result.authorize
					? ''
					: 'h-72 flex items-center justify-center'}"
			>
				<span class="absolute -top-3 left-4 bg-white dark:bg-[#151515] px-2 -mx-2"
					>Authorization Response</span
				>
				{#if !result.authorize}
					<span class="opacity-80">Nothing to see here yet</span>
				{:else}
					<div class="space-y-4">
						<section class="btn group">
							<button
								on:click={() => (dropdown.authorize = !dropdown.authorize)}
								class="py-2 w-full flex justify-between items-center px-4"
							>
								<div class="flex flex-col items-start text-left">
									<span class="font-semibold text-lg" style="word-break: break-word;"
										>{new URL('/authorize', states.selected_authorization_server)}</span
									>
									<div class="inline-flex items-center">
										<span>Response</span>
										<!-- <button
											on:click={() => {
												if (!result.authorize) return;
												dropdown.authorize = false;
												copy('authorize', JSON.stringify(result.authorize));
											}}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-5 ml-1 stroke-2 hover:stroke-3"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
												/>
											</svg>
										</button> -->
									</div>
								</div>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="stroke-2 group-hover:stroke-3 h-5 transform"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									class:rotate-180={dropdown.authorize}
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
								</svg>
							</button>

							{#if dropdown.authorize}
								<p class="p-4 break-words">
									<span class:flash={copyTooltip.authorize} class="text-sm">{result.authorize}</span
									>
								</p>
							{/if}
						</section>

						{#if result.token !== null}
							<section class="btn group">
								<button
									on:click={() => (dropdown.token = !dropdown.token)}
									class="py-2 w-full flex justify-between items-center px-4"
								>
									<div class="flex flex-col items-start text-left">
										<span class="font-semibold text-lg" style="word-break: break-word;"
											>{new URL('/oauth/token', states.selected_authorization_server)}</span
										>
										<div class="inline-flex items-center">
											<span>Response</span>
											<!-- <button
												on:click={() => {
													if (!result.token) return;
													dropdown.token = false;
													copy('token', JSON.stringify(result.token));
												}}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-5 ml-1 stroke-2 hover:stroke-3"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
													/>
												</svg>
											</button> -->
										</div>
									</div>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="stroke-2 group-hover:stroke-3 h-5 transform"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										class:rotate-180={dropdown.token}
									>
										<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
									</svg>
								</button>
								{#if dropdown.token}
									<span class:flash={copyTooltip.token} class="text-sm json-container">
										{@html highlight('json', JSON.stringify(result.token, null, 2))}
									</span>
								{/if}
							</section>
						{/if}

						{#if result.userinfo !== null}
							<section class="btn group">
								<button
									on:click={() => (dropdown.userinfo = !dropdown.userinfo)}
									class="py-2 w-full flex justify-between items-center px-4"
								>
									<div class="flex flex-col items-start text-left">
										<span class="font-semibold text-lg" style="word-break: break-word;"
											>{new URL('/oauth/userinfo', states.selected_authorization_server)}</span
										>
										<div class="inline-flex items-center">
											<span>Response</span>
											<!-- <button
												on:click={() => {
													if (!result.token) return;
													dropdown.userinfo = false;
													copy('userinfo', JSON.stringify(result.userinfo));
												}}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-5 ml-1 stroke-2 hover:stroke-3"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
													/>
												</svg>
											</button> -->
										</div>
									</div>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="stroke-2 group-hover:stroke-3 h-5 transform"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										class:rotate-180={dropdown.userinfo}
									>
										<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
									</svg>
								</button>
								{#if dropdown.userinfo}
									<span class:flash={copyTooltip.userinfo} class="text-sm json-container">
										{@html highlight('json', JSON.stringify(result.userinfo, null, 2))}
									</span>
								{/if}
							</section>
						{/if}

						{#if result.introspect !== null}
							<section class="btn group">
								<button
									on:click={() => (dropdown.introspect = !dropdown.introspect)}
									class="py-2 w-full flex justify-between items-center px-4"
								>
									<div class="flex flex-col items-start text-left">
										<span class="font-semibold text-lg" style="word-break: break-word;"
											>{new URL('/oauth/introspect', states.selected_authorization_server)}</span
										>
										<div class="inline-flex items-center">
											<span>Response</span>
											<!-- <button
												on:click={() => {
													if (!result.introspect) return;
													dropdown.introspect = false;
													copy('introspect', JSON.stringify(result.introspect));
												}}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-5 ml-1 stroke-2 hover:stroke-3"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
													/>
												</svg>
											</button> -->
										</div>
									</div>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="stroke-2 group-hover:stroke-3 h-5 transform"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										class:rotate-180={dropdown.introspect}
									>
										<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
									</svg>
								</button>
								{#if dropdown.introspect}
									<span class:flash={copyTooltip.introspect} class="text-sm json-container">
										{@html highlight('json', JSON.stringify(result.introspect, null, 2))}
									</span>
								{/if}
							</section>
						{/if}

						{#if result.introspect}
							<section class="btn group">
								<button
									on:click={() => (dropdown.claims = !dropdown.claims)}
									class="h-12 w-full flex justify-between items-center px-4"
								>
									<span class="font-semibold text-lg">Claims</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="stroke-2 group-hover:stroke-3 h-5 transform"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										class:rotate-180={dropdown.claims}
									>
										<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
									</svg>
								</button>
								{#if dropdown.claims}
									<ul
										class="flex flex-col px-4 divide-y divide-black/50 dark:divide-white/50 overflow-x-auto"
									>
										{#each scopes.claims.filter((i) => result.introspect[i]) as claim}
											{@const isString = typeof result.introspect[claim] == 'string'}
											<li class="py-4 flex items-center">
												<div class="w-1/4 md:w-1/3 flex-shrink-0">{claim}</div>
												<div>
													{#if claim === 'picture' && result.introspect[claim]}
														<!-- svelte-ignore a11y-img-redundant-alt -->
														<img
															src={result.introspect[claim]}
															class="h-10 w-10 rounded-full object-fit"
															alt="Picture claim"
														/>
													{:else if isString}
														{result.introspect[claim]}
													{:else}
														<pre>{JSON.stringify(result.introspect[claim], null, 2)}</pre>
													{/if}
												</div>
											</li>
										{/each}
									</ul>
								{/if}
							</section>
						{/if}
					</div>
				{/if}
			</section>

			<section
				class="relative border border-charcoal dark:border-gray-800 rounded-sm w-full px-4 pb-4 pt-6"
			>
				<span class="absolute -mt-9 bg-white dark:bg-[#151515] px-2 -mx-2">Invite Request</span>
				<div class="max-w-lg mx-auto">
					{#if canInvite}
						<div
							class="overflow-x-auto bg-[#F2F6FB] dark:bg-charcoal rounded-sm p-4 break-words mb-6"
						>
							<h2 class="inline-flex items-center">
								<span>Invite URL</span>
								<!-- <button on:click={() => copy('invitePlaygroundURL', invitePlaygroundURL)}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 ml-1 stroke-2 hover:stroke-3"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
										/>
									</svg>
								</button> -->
							</h2>
							<span
								class="url-container mt-2 block text-sm whitespace-pre-line"
								class:flash={copyTooltip.invitePlaygroundURL}
							>
								{@html highlight('http', invitePlaygroundURL)}
							</span>
						</div>
					{/if}

					<button
						on:click={invitePlaygroundWithHello}
						class="hello-btn-black-and-static w-full disabled:opacity-30"
						class:hello-btn-loader={invitePlaygroundWithHelloAjax}
						disabled={invitePlaygroundWithHelloAjax || !canInvite}
						class:hello-btn-hover-flare={darkMode}>Invite others to Playground</button
					>
					<p class="text-sm text-center mt-4 opacity-80">
						{#if canInvite}
							Use this to test sending invitations
						{:else}
							To invite others, your must provide the<br />`name` and `email` claims
						{/if}
					</p>
				</div>
			</section>

			<section class="py-6">
				<a
					href="https://github.com/hellocoop/playground/issues/new"
					target="_blank"
					class="inline-flex items-center hover:underline"
				>
					<span>File an issue on GitHub</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-3 ml-1"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
						/>
					</svg>
				</a>
			</section>
		</div>
		<wc-footer />
	</main>
{/if}

<style>
	:global(.json-container pre) {
		padding: 14px;
		overflow-x: auto;
	}

	:global(.url-container pre) {
		background-color: transparent !important;
	}

	.nav-link:hover::after {
		width: 100%;
		content: ' ';
		height: 2px;
		background-color: white;
		display: inline-block;
		position: absolute;
		bottom: -4px;
		left: 0;
	}

	.flash {
		animation: flash-animation 0.5s ease-in-out;
	}

	@keyframes flash-animation {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
		100% {
			opacity: 1;
		}
	}
</style>
