<script>
	import { onMount, tick } from 'svelte';
	import { slide } from 'svelte/transition';
	import makePKCE from './utils/pkce.js';
	import { createHighlighterCore } from 'shiki';
	import getWasm from 'shiki/wasm'; //TBD: does not work without importin this

	let readFromLocalStorage = false;
	let darkMode = false;
	let highlighter;

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
		update: ['update_profile', 'update_email', 'update_phone', 'update_picture'],
		custom: ['ethereum', 'discord', 'twitter', 'github', 'gitlab'],
		required: ['openid'],
		claims: [
			'sub',
			'name',
			'nickname',
			'given_name',
			'family_name',
			'email',
			'phone',
			'picture',
			'ethereum',
			'discord',
			'twitter',
			'github',
			'gitlab'
		]
	};

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
		'email',
		'phone',
		'ethereum',
		'qrcode',
		'passkey'
		// 'managed'
	];

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
					.filter((i) => !possibleSlugs.includes(i) && i);

				if (invalidSlugs?.length) {
					invalidProviderHintSlug = Array.from(invalidSlugs);
				} else {
					invalidProviderHintSlug = null;
				}
			}, 250);
		}
	}

	onMount(async () => {
		highlighter = await createHighlighterCore({
			themes: [import('shiki/themes/github-dark.mjs'), import('shiki/themes/github-light.mjs')],
			langs: [import('shiki/langs/json.mjs'), import('shiki/langs/http.mjs')],
			loadWasm: getWasm //TBD: does not work without importin this
		});

		if (!getStatesFromLocalStorage()) {
			//states not found in local storage, save default states to local storage
			const _states = JSON.stringify(states);
			localStorage.setItem('states', _states);
		}
		readFromLocalStorage = true;

		processFragmentOrQuery();
		updateFavicon();

		sendEvent();

		if (localStorage.plausible_ignore == 'true') {
			const _standard_scopes = ['preferred_username'];
			const _custom_scopes = [
				// "twitter",
				// "github",
				// "gitlab",
				// "mastodon",
				// "instagram",
				// "bio",
				// "banner",
				'recovery',
				'verified_name',
				'existing_name',
				'existing_username'
			];
			scopes.standard = [...scopes.standard, ..._standard_scopes];
			scopes.custom = [...scopes.custom, ..._custom_scopes];
			scopes.claims = [...scopes.claims, ..._standard_scopes, ..._custom_scopes];
			protocolParams.params.passkeys = states.protocol_param_values.passkeys = 'global';
		}

		if (
			!['https://wallet.hello.coop/authorize', ...states.custom_authorization_servers].includes(
				states.selected_authorization_server
			)
		) {
			custom_authorization_server = states.selected_authorization_server;
		}

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
	});

	const navLinks = [
		{
			text: 'Documentation',
			link: 'https://hello.dev/documentation/'
		},
		{
			text: 'Console',
			link: 'https://console.hello.coop/'
		}
	];

	const clientIds = {
		playground: 'app_HelloDeveloperPlayground_Iq2',
		playground_old: '46be57a7-d0f5-459e-9655-24799433637d',
		greenfield: 'app_GreenfieldFitnessDemoApp_s9z'
	};

	const updateScopes = ['name', 'email', 'picture', 'phone', 'profile'];

	let errorNotification = null;

	const queryParams = {
		params: {
			provider_hint: ''
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
			prompt: ['login', 'consent'],
			login_hint: '',
			custom: '',
			scope: ''
		},
		required: ['client_id', 'redirect_uri', 'nonce', 'response_type']
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
	let custom_scope = '';

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
			login_hint: 'login'
		},
		dropdowns: {
			scopeParam: true,
			queryParams: true,
			protocolParams: false,
			authzServer: false,
			requestURL: true
		}
	};

	//default values, also binds to user input
	let states = {
		selected_authorization_server: 'https://wallet.hello.coop/authorize',
		custom_authorization_servers: [],
		update_scope: false,
		scopes: ['openid'],
		custom_scopes: [],
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

	function updateFavicon() {
		const ref = document.querySelector("link[rel='icon']");
		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
			ref.href = 'dark-favicon.png';
		}
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
			if (event.matches) {
				ref.href = 'light-favicon.png';
			} else {
				ref.href = 'dark-favicon.png';
			}
		});
	}

	async function processFragmentOrQuery() {
		if (!window.location.hash && !window.location.search) return;

		let protocolParams;
		if (window.location.hash) {
			protocolParams = new URLSearchParams(window.location.hash.substring(1));
			result.authorize = window.location.hash;
		} else if (window.location.search) {
			protocolParams = new URLSearchParams(window.location.search);
			result.authorize = window.location.search;
		}
		cleanURL();
		const id_token = protocolParams.get('id_token');
		const loginHint = protocolParams.get('login_hint');
		const code = protocolParams.get('code');
		const initiate_login = protocolParams.get('initiate-login');
		const iss = protocolParams.get('iss');
		const error = protocolParams.get('error');
		if (error) {
			errorNotification = error?.replaceAll('_', ' ');
		}
		if (iss) {
			try {
				const res = await fetch(iss + '/.well-known/openid-configuration');
				const { authorization_endpoint } = await res.json();
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
				window.location.href = _requestUrl;
			} catch (err) {
				console.error(err);
				errorNotification = 'Invalid Issuer URL';
			}
		}
		if (initiate_login) {
			await tick(); //wait for requestURL to compute
			const url = new URL(initiate_login);
			const loginHint = protocolParams.get('login_hint');
			const existingSearchParams = new URL(requestURL).search;
			if (existingSearchParams) {
				url.search = existingSearchParams;
			}
			if (loginHint) {
				url.searchParams.set('login_hint', loginHint);
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

			//Purge localstorage cache -- replace old playground client_id with new if not a response flow
			const hasAuthzRes =
				window.location?.hash?.includes('id_token') || window.location?.seach?.includes('id_token');
			if (!hasAuthzRes && _states.protocol_param_values.client_id === clientIds.playground_old) {
				_states.protocol_param_values.client_id = clientIds.playground;
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
						url.search += queryParamValues[param];
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
					if (param === 'custom' && type == 'request') {
						url.search += protocolParamValues[param];
						continue;
					}
					const protocol_param_value = protocolParamValues[param];
					if (protocol_param_value) {
						url.searchParams.set(param, protocol_param_value);
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
			if (
				!['https://wallet.hello.coop/authorize', ...states.custom_authorization_servers].includes(
					url.href
				)
			) {
				states.custom_authorization_servers = [...states.custom_authorization_servers, url.href];
				states.selected_authorization_server = url.href;
				custom_authorization_server = '';
			}

			//save custom scope
			states.custom_scopes = [...states.custom_scopes, custom_scope];
			custom_scope = '';
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
				const { code_challenge, code_verifier } = await makePKCE();
				states.protocol_param_values.code_challenge = code_challenge;
				states.protocol_param_values.code_verifier = code_verifier;
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

	async function sendEvent() {
		if (localStorage.getItem('plausible_ignore') == 'true') {
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
		window.location.reload();
	};

	$: canInvite =
		states.invite_playground_query_param_values.inviter &&
		result.introspect?.name &&
		result.introspect?.email;

	const highlight = (lang, content) => {
		if (!highlighter) return '...';
		const html = highlighter.codeToHtml(content, {
			lang,
			themes: { light: 'github-light', dark: 'github-dark' }
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

<header
	class="text-white dark:text-gray flex-shrink-0 bg-charcoal h-12 flex items-center justify-between px-4 font-medium text-lg"
>
	<div class="w-1/3 inline-flex items-center">
		<button on:click={() => (mobileMenu = !mobileMenu)} class="lg:hidden mr-2 group">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					class="stroke-2 group-hover:stroke-3"
					d="M4 6h16M4 12h16M4 18h16"
				/>
			</svg>
		</button>
		<a
			href="https://hello.dev"
			target="_blank"
			class="hidden sm:inline-flex items-center relative nav-link"
		>
			<span>hello.dev</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 ml-1 mt-0.5 opacity-80 flex-shrink-0"
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
	</div>
	<span class="md:w-1/3 flex justify-center flex-shrink-0">
		<img src="logo.svg" alt="Hellō Playground" />
	</span>
	<div class="w-1/3 flex justify-end space-x-4">
		<ul class="hidden lg:flex space-x-4">
			{#each navLinks as { text, link }}
				<li class="nav-link text-sm font-normal relative">
					<a href={link} target="_blank" class="inline-flex items-center">
						{text}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-3 ml-1 mt-0.5 opacity-80"
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
				</li>
			{/each}
		</ul>
	</div>

	{#if mobileMenu}
		<div class="bg-charcoal lg:hidden absolute left-0 top-12 w-full px-4 z-50 min-w-[320px]">
			<ul class="flex flex-col gap-y-3 pb-4 text-base">
				<li class="nav-link relative sm:hidden">
					<a href="https://hello.dev" target="_blank" class="inline-flex items-center font-medium">
						hello.dev
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 ml-1 mt-0.5 opacity-80"
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
				</li>
				{#each navLinks as { text, link }}
					<li class="nav-link relative">
						<a href={link} target="_blank" class="inline-flex items-center font-medium">
							{text}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 ml-1 mt-0.5 opacity-80"
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
					</li>
				{/each}
			</ul>
		</div>

		<div
			on:click={() => (mobileMenu = false)}
			class="lg:hidden fixed top-12 left-0 z-40 bg-black bg-opacity-60 w-full h-full"
		/>
	{/if}
</header>

{#if errorNotification}
	<div class="bg-red-500 p-2.5 text-center text-white flex items-center justify-center" out:slide>
		<span class="capitalize text-sm">{errorNotification}</span>
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
				<button
					on:click={resetAll}
					class="absolute -top-3 right-4 bg-red-500 px-3 rounded-xl border border-charcoal dark:border-gray-800 text-sm bg-white dark:bg-[#151515]"
					>Reset</button
				>

				<div class="columns-1 md:columns-2 xl:columns-3 4xl:columns-4 gap-x-12 space-y-6">
					<!-- Scope Param -->
					<div
						class="break-inside-avoid-column"
						class:opacity-50={states.protocol_params.includes('scope')}
						class:pointer-events-none={states.protocol_params.includes('scope')}
					>
						<div class="space-x-6 inline-flex justify-between items-center">
							<button
								class="inline-flex items-center space-x-2"
								on:click={() => (states.dropdowns.scopeParam = !states.dropdowns.scopeParam)}
							>
								<h1 class="font-semibold text-lg inline-block">Scope Param</h1>
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

							<!-- {#if states.dropdowns.scopeParam}
								<div class="px-1">
									<input
										type="checkbox"
										class="text-charcoal form-checkbox dark:text-gray-800"
										name="update-scope"
										id="update-scope"
										bind:checked={states.update_scope}
									/>
									<label for="update-scope" class="ml-2">update</label>
								</div>
							{/if} -->
						</div>
						{#if states.dropdowns.scopeParam}
							<div class="mt-2" transition:slide|local>
								<div class="flex gap-x-4 pl-1">
									<ul class="space-y-2 mt-2 w-44">
										{#each scopes.standard as scope}
											{@const required = scopes.required.includes(scope)}
											{@const disabled =
												states.update_scope && !['openid', ...updateScopes].includes(scope)}
											{@const error =
												states.update_scope &&
												updateScopes.includes(scope) &&
												states.scopes.filter((i) => i.startsWith('update_')).length > 1}
											<li
												class="flex items-center"
												class:opacity-50={disabled}
												class:pointer-events-none={disabled}
												class:text-red-500={required && !states.scopes.includes(scope)}
											>
												<input
													type="checkbox"
													class="text-charcoal form-checkbox dark:text-gray-800"
													name={scope}
													id={scope}
													value={states.update_scope && updateScopes.includes(scope)
														? 'update_' + scope
														: scope}
													bind:group={states.scopes}
												/>
												<label for={scope} class="ml-2" class:text-red-500={error}
													>{states.update_scope && updateScopes.includes(scope)
														? 'update_' + scope
														: scope}
													{required ? '*' : ''}</label
												>
											</li>
										{/each}
									</ul>
									<ul class="space-y-2 mt-2 truncate">
										{#each scopes.custom as scope}
											{@const required = scopes.required.includes(scope)}
											<li
												class="flex items-center truncate pl-1"
												class:text-red-500={required && !states.scopes.includes(scope)}
												class:opacity-50={states.update_scope && !updateScopes.includes(scope)}
												class:pointer-events-none={states.update_scope &&
													!updateScopes.includes(scope)}
											>
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

										<!-- <li
											class="flex items-center pl-1"
											class:opacity-50={states.update_scope && !updateScopes.includes(custom_scope)}
											class:pointer-events-none={states.update_scope && !updateScopes.includes(custom_scope)}
										>
											<input type="checkbox" bind:group={states.scopes} value={custom_scope} class="text-charcoal form-checkbox dark:text-gray-800" />
											<input
												type="text"
												class="h-6 px-2 ml-2 w-32 form-input italic"
												autocomplete="off"
												autocorrect="off"
												autocapitalize="off"
												spellcheck="false"
												bind:value={custom_scope}
											/>
										</li> -->
									</ul>
								</div>
							</div>
						{/if}
					</div>

					<!-- Protocol Params -->
					<div class="break-inside-avoid-column">
						<button
							class="inline-flex items-center space-x-2"
							on:click={() => (states.dropdowns.protocolParams = !states.dropdowns.protocolParams)}
						>
							<h1 class="font-semibold text-lg inline-block">Protocol Params</h1>
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
						{#if states.dropdowns.protocolParams}
							<ul class="space-y-2 mt-2" transition:slide|local>
								{#each Object.entries(protocolParams.params) as [param, value]}
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
														states.protocol_param_values.response_type === 'id_token')}
											>
												{param}
												{required ? '*' : ''}
											</label>
										</div>

										<div class="w-1/2 md:w-3/4">
											{#if Array.isArray(value)}
												<div
													class="xl:h-9 p-1 space-y-0.5 xl:space-y-0 xl:space-x-0.5 w-full ring-1 ring-charcoal dark:ring-gray-800 flex flex-col xl:flex-row items-center rounded-sm"
													class:opacity-60={!states.protocol_params.includes(param) &&
														param !== 'response_mode'}
												>
													{#each value as ele}
														<button
															on:click={() => (states.protocol_param_values[param] = ele)}
															disabled={param === 'response_mode' &&
																!states.protocol_params.includes('response_mode')}
															class="{states.protocol_param_values[param] === ele
																? 'bg-charcoal text-white dark:text-gray border border-charcoal dark:border-gray-800'
																: 'hover:border hover:border-charcoal dark:hover:border-[#808080] disabled:cursor-not-allowed disabled:hover:border-none disabled:border-none border border-white dark:border-[#151515]'} w-full xl:w-1/2 h-full
								"
														>
															{ele}
														</button>
													{/each}
												</div>
											{:else}
												<div
													class="flex flex-col w-full items-start"
													class:opacity-60={!states.protocol_params.includes(param) &&
														param !== 'code_challenge'}
												>
													<!-- {#if param === "client_id"}
								<div class="mb-0.5">
								<button
									on:click={() =>
									(states.protocol_param_values.client_id =
										clientIds.playground)}
									class="text-xs xl:text-sm hover:underline"
									>Playground</button
								>
								<button
									on:click={() =>
									(states.protocol_param_values.client_id =
										clientIds.greenfield)}
									class="text-xs xl:text-sm hover:underline xl:ml-2"
									>GreenfieldFitness</button
								>
								</div>
							{/if} -->
													<input
														type="text"
														name={param}
														class="h-6 px-2 w-full form-input"
														autocomplete="off"
														autocorrect="off"
														autocapitalize="off"
														spellcheck="false"
														bind:value={states.protocol_param_values[param]}
													/>
												</div>
											{/if}

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
															.filter((i) => !['google', 'email', 'passkey'].includes(i))
															.join(' ')}</span
													><br />
													<span class="opacity-80"
														>apple-- microsoft-- google-- email-- passkey--</span
													>
												</p>
											{/if}
										</div>
									</li>
								{/each}
							</ul>
						{/if}
					</div>

					<!-- Query Params -->
					<div class="break-inside-avoid-column">
						<button
							class="inline-flex items-center space-x-2"
							on:click={() => (states.dropdowns.queryParams = !states.dropdowns.queryParams)}
						>
							<h1 class="font-semibold text-lg inline-block">Query Params</h1>
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
						{#if states.dropdowns.queryParams}
							<ul class="space-y-2 mt-2" transition:slide|local>
								{#each Object.entries(queryParams.params) as [param, value]}
									{@const required = queryParams.required.includes(param)}
									<li
										class="flex {param === 'provider_hint'
											? 'items-start'
											: 'items-center'} relative"
										class:pb-2={param === 'custom'}
										class:pt-2={param === 'provider_hint'}
									>
										<div
											class="w-1/2 md:w-1/4 flex-shrink-0 md:min-w-[10rem] flex items-center"
											class:mt-6={param === 'client_id'}
											class:mt-1={param === 'provider_hint'}
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
														states.query_param_values.response_type === 'id_token')}
											>
												{param}
												{required ? '*' : ''}
											</label>
										</div>

										<div class="w-1/2 md:w-3/4">
											<div
												class="flex flex-col w-full items-start"
												class:opacity-60={!states.query_params.includes(param) &&
													param !== 'code_challenge'}
											>
												<input
													type="text"
													name={param}
													class="h-6 px-2 w-full form-input"
													autocomplete="off"
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
															.filter((i) => !['google', 'email', 'passkey'].includes(i))
															.join(' ')}</span
													><br />
													<span class="opacity-80"
														>apple-- microsoft-- google-- email-- passkey--</span
													>
												</p>
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
							<div
								class="bg-gray-200 dark:bg-charcoal rounded-sm p-4 break-words mt-2 relative overflow-x-auto"
								transition:slide|local
							>
								<button
									on:click={() => copy('requestURL', requestURL)}
									class="absolute right-4 top-4"
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
								</button>
								<span
									class="url-container block text-sm whitespace-pre-line"
									class:flash={copyTooltip.requestURL}
								>
									{@html highlight('http', requestURL)}
								</span>
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
										<button
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
										</button>
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
											<button
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
											</button>
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
											<button
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
											</button>
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
											<button
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
											</button>
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
							class="overflow-x-auto bg-gray-200 dark:bg-charcoal rounded-sm p-4 break-words mb-6"
						>
							<h2 class="inline-flex items-center">
								<span>Invite URL</span>
								<button on:click={() => copy('invitePlaygroundURL', invitePlaygroundURL)}>
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
								</button>
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

			<!-- {#if (result.introspect?.sub || states.invite_query_param_values.inviter) && localStorage.plausible_ignore == 'true'}
				<section class="border border-charcoal dark:border-gray-800 rounded-sm w-full p-4">
					<h1 class="font-semibold text-lg">Invite</h1>
					<div class="flex items-start flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-5 mt-2">
						<div class="w-full lg:w-1/4 lg:max-w-sm lg:min-w-[18rem]">
							<div class="bg-gray-200 dark:bg-charcoal rounded-sm p-4 break-words mt-2 mb-6">
								<h2 class="inline-flex items-center">
									<span>Invite URL</span>
									<button on:click={() => copy('inviteURL', inviteURL)}>
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
									</button>
								</h2>
								<span
									class="mt-2 block text-sm whitespace-pre-line"
									class:flash={copyTooltip.inviteURL}
								>
									{inviteURL}
								</span>
							</div>

							<button
								on:click={inviteWithHello}
								class="hello-btn-black-and-static w-full hidden lg:flex"
								class:hello-btn-loader={inviteWithHelloAjax}
								disabled={inviteWithHelloAjax}
								class:hello-btn-hover-flare={darkMode}>ō&nbsp;&nbsp;&nbsp;Invite with Hellō</button
							>
						</div>
						<div class="w-full lg:w-1/2 lg:max-w-xl lg:min-w-[18rem] mt-4 pl-1">
							<h2>Query Params (* required)</h2>
							<div class="mt-2">
								<ul class="space-y-2 mt-2">
									{#each Object.entries(inviteQueryParams.params) as [param, value]}
										{@const isString = typeof value == 'string'}
										{@const required = inviteQueryParams.required.includes(param)}
										<li class="flex items-center relative">
											<div
												class="w-1/2 md:w-1/4 flex-shrink-0 md:min-w-[12rem] flex items-center"
												class:mt-6={param === 'client_id'}
											>
												<input
													type="checkbox"
													bind:group={states.invite_query_params}
													class="text-charcoal form-checkbox dark:text-gray-800"
													name={param}
													id={'invite/' + param}
													value={param}
												/>
												<label
													for={'invite/' + param}
													class="ml-2"
													class:text-red-500={//required
													required &&
														(!states.invite_query_params.includes(param) ||
															//if checked and empty field
															!states.invite_query_param_values[param])}
												>
													{param}
													{required ? '*' : ''}
												</label>
											</div>

											<div class="w-1/2 md:w-3/4">
												<div
													class="flex flex-col w-full items-start"
													class:opacity-60={!states.invite_query_params.includes(param)}
												>
													{#if param === 'client_id'}
														<div class="mb-0.5">
															<button
																on:click={() =>
																	(states.invite_query_param_values.client_id = clientIds.playground)}
																class="text-xs xl:text-sm hover:underline">Playground</button
															>
															<button
																on:click={() =>
																	(states.invite_query_param_values.client_id = clientIds.greenfield)}
																class="text-xs xl:text-sm hover:underline xl:ml-2"
																>GreenfieldFitness</button
															>
														</div>
													{/if}
													{#if isString}
														<input
															type="text"
															name={param}
															class="h-8 w-full form-input"
															autocomplete="off"
															autocorrect="off"
															autocapitalize="off"
															spellcheck="false"
															placeholder={param === 'prompt' ? 'Subscribe to Blue Fox' : ''}
															bind:value={states.invite_query_param_values[param]}
														/>
													{:else}
														{states.invite_query_params.includes(param)}
													{/if}
												</div>
											</div>
										</li>
									{/each}
								</ul>
							</div>
						</div>
						<button
							on:click={inviteWithHello}
							class="hello-btn-black-and-static w-full lg:hidden"
							class:hello-btn-loader={inviteWithHelloAjax}
							disabled={inviteWithHelloAjax}
							class:hello-btn-hover-flare={darkMode}>ō&nbsp;&nbsp;&nbsp;Invite with Hellō</button
						>
					</div>
				</section>
			{/if} -->

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
	@media (prefers-color-scheme: dark) {
		:global(.shiki),
		:global(.shiki span) {
			color: var(--shiki-dark) !important;
			background-color: var(--shiki-dark-bg) !important;
		}
	}

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
