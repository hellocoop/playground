const SCOPE_PARAM = {
    STANDARD: [
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
    NON_STANDARD: [
        'ethereum',
        'discord',
        'twitter',
        'github',
        'gitlab'
    ],
    REQUIRED: ['openid'],
    DEFAULT_SELECTED: ['openid', 'profile'],

    // Hellō Dev Mode
    HELLO_EXTEND_STANDARD: ['preferred_username'],
    HELLO_EXTEND_NON_STANDARD: ['recovery', 'verified_name', 'existing_name', 'existing_username']
}

const PROTOCOL_PARAM = {
    PARAMS: [
        {
            NAME: 'client_id',
            POSSIBLE_VALUE: ''
        },
        {
            NAME: 'nonce',
            POSSIBLE_VALUE: ''
        },
        {
            NAME: 'redirect_uri',
            POSSIBLE_VALUE: ''
        },
        {
            NAME: 'response_type',
            POSSIBLE_VALUE: ['id_token', 'code'],
            ONLY_ONE: true
        },
        {
            NAME: 'code_challenge',
            POSSIBLE_VALUE: ''
        },
        {
            NAME: 'code_verifier',
            POSSIBLE_VALUE: ''
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
            POSSIBLE_VALUE: ''
        },
        {
            NAME: 'scope',
            POSSIBLE_VALUE: ''
        }
    ],
    REQUIRED: [
        'client_id',
        'nonce',
        'redirect_uri',
        'response_type'
    ],
    DEFAULT_SELECTED: {
        client_id: 'app_HelloDeveloperPlayground_Iq2',
        nonce: '123',
        redirect_uri: 'http://localhost:5173/',
        response_type: 'id_token'
    }
}

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
].sort()

const HELLO_PARAM = {
    PARAMS: [
        {
            NAME: 'provider_hint',
            POSSIBLE_VALUE: PROVIDER_HINTS,
            ONLY_ONE: false
        },
        {
            NAME: 'domain_hint',
            POSSIBLE_VALUE: ['personal', 'managed', 'domain.example'],
            ONLY_ONE: true
        }
    ],
    REQUIRED: ''
}

const PARAMS = {
    SCOPE_PARAM,
    PROTOCOL_PARAM,
    HELLO_PARAM
}

const AUTHZ_SERVERS = [
    'https://wallet.hello.coop/authorize',
    'https://wallet.hello-beta.net/authorize'
]

export {
    PARAMS,
    AUTHZ_SERVERS
}