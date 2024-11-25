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

    // Hellō Dev Mode
    HELLO_EXTEND_STANDARD: ['preferred_username'],
    HELLO_EXTEND_NON_STANDARD: ['recovery', 'verified_name', 'existing_name', 'existing_username']
}

const PROTOCOL_PARAM = {
    PARAMS: [
        'client_id',
        'nonce',
        'rediect_uri',
        {
            NAME: 'response_type',
            POSSIBLE_VALUES: ['code', 'id_token'],
            ONLY_ONE: true
        },
        'code_challenge',
        'code_verifier',
        {
            NAME: 'response_mode',
            POSSIBLE_VALUES: ['fragment', 'query'],
            ONLY_ONE: true
        },
        'state',
        {
            NAME: 'prompt',
            POSSIBLE_VALUES: ['consent', 'login'],
            ONLY_ONE: false
        },
        'login_hint',
        'scope'
    ],
    REQUIRED: [
        'client_id',
        'nonce',
        'redirect_uri',
        'response_type'
    ]
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
            POSSIBLE_VALUES: PROVIDER_HINTS,
            ONLY_ONE: false
        },
        {
            NAME: 'domain_hint',
            POSSIBLE_VALUES: ['personal', 'managed', 'domain.example'],
            ONLY_ONE: true
        }
    ],
    REQUIRED: []
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