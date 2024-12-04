const PROFILE_CLAIMS = ['name', 'email', 'picture'];

const SCOPE_PARAM = {
	STANDARD: [
		'openid',
		'profile',
		...PROFILE_CLAIMS,
		'nickname',
		'given_name',
		'family_name',
		'phone'
	],
	NON_STANDARD: ['ethereum', 'discord', 'twitter', 'github', 'gitlab'],

	// Hellō Dev Mode
	HELLO_EXTEND_STANDARD: ['preferred_username'],
	HELLO_EXTEND_NON_STANDARD: ['recovery', 'verified_name', 'existing_name', 'existing_username'],

	REQUIRED: ['openid'],
	DEFAULT_SELECTED: ['openid', 'profile']
};

const PROTOCOL_PARAM = {
	PARAMS: [
		{
			NAME: 'client_id',
			POSSIBLE_VALUE: ''
		},
		{
			NAME: 'redirect_uri',
			POSSIBLE_VALUE: ''
		},
		{
			NAME: 'nonce',
			POSSIBLE_VALUE: ''
		},
		{
			NAME: 'response_type',
			POSSIBLE_VALUE: ['code', 'id_token'],
			ONLY_ONE: true
		},
		{
			NAME: 'code_challenge',
			POSSIBLE_VALUE: ''
		},
		{
			NAME: 'code_verifier',
			POSSIBLE_VALUE: '',
			CHECKBOX_HIDDEN: true
		},
		{
			NAME: 'response_mode',
			POSSIBLE_VALUE: ['fragment', 'query'],
			ONLY_ONE: true
		},
		{
			NAME: 'state',
			POSSIBLE_VALUE: ''
		},
		{
			NAME: 'prompt',
			POSSIBLE_VALUE: ['consent', 'login'],
			ONLY_ONE: false
		},
		{
			NAME: 'login_hint',
			POSSIBLE_VALUE: '',
			PLACEHOLDER: 'name@example.com'
		},
		{
			NAME: 'scope',
			POSSIBLE_VALUE: '',
			PLACEHOLDER: 'space separated'
		}
	],
	REQUIRED: ['client_id', 'nonce', 'redirect_uri', 'response_type'],
	DEFAULT_SELECTED: [
		'client_id',
		'nonce',
		'redirect_uri',
		'response_type',
		'code_challenge',
		'response_mode'
	],
	DEFAULT_VALUES: {
		client_id: 'app_HelloDeveloperPlayground_Iq2',
		redirect_uri: 'https://playground.hello.dev/',
		response_type: 'code',
		response_mode: 'fragment',
		prompt: 'consent'
	}
};

const PROVIDER_HINTS = [
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
].sort();

const HELLO_PARAM = {
	PARAMS: [
		{
			NAME: 'provider_hint',
			POSSIBLE_VALUE: PROVIDER_HINTS,
			HINT: [...PROVIDER_HINTS, 'apple--', 'microsoft--', 'google-', 'email--', 'passkey--'].join(
				' '
			),
			ONLY_ONE: false
		},
		{
			NAME: 'domain_hint',
			POSSIBLE_VALUE: '',
			HINT: 'personal | managed | domain.example',
			ONLY_ONE: true
		},
		{
			NAME: 'custom',
			POSSIBLE_VALUE: '',
			PLACEHOLDER: 'foo=bar&hello=world'
		}
	],

	// Hellō Dev Mode
	HELLO_EXTEND_PARAMS: [
		{
			NAME: 'passkeys',
			POSSIBLE_VALUE: ''
		}
	],

	REQUIRED: [],
	DEFAULT_SELECTED: [],
	DEFAULT_VALUES: {
		passkeys: 'global'
	}
};

const PARAMS = {
	SCOPE_PARAM,
	PROTOCOL_PARAM,
	HELLO_PARAM
};

const BETA_SERVER = 'https://wallet.hello-beta.net/authorize';

const SERVERS = ['https://wallet.hello.coop/authorize', BETA_SERVER];

const AUTHZ_SERVERS = {
	SERVERS,
	DEFAULT_SELECTED: SERVERS[0],

	// Hellō Dev Mode
	HELLO_EXTEND_SERVERS: [
		'https://wallet.hello-staging.net/authorize',
		'https://wallet.hello-local.net/authorize',
		'https://wallet.hello-dev.net/authorize'
	]
};

export { PARAMS, AUTHZ_SERVERS, BETA_SERVER, PROFILE_CLAIMS };
