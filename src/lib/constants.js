import { createAuthRequest } from "@hellocoop/helper-browser"

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

    // Hellō Dev Mode
    HELLO_EXTEND_STANDARD: ['preferred_username'],
    HELLO_EXTEND_NON_STANDARD: ['recovery','verified_name','existing_name','existing_username'],

    REQUIRED: ['openid'],
    DEFAULT_SELECTED: ['openid','profile'],
}

const { url,nonce,code_verifier } = await createAuthRequest({
    // we just need nonce & code_verifier
    client_id: 'x',
    redirect_uri: 'x'
})
// because helper-browser only returns code_verifier in url 
const code_challenge = new URL(url).searchParams.get('code_challenge')

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
            POSSIBLE_VALUE: ['code','id_token'],
            ONLY_ONE: true
        },
        {
            NAME: 'code_challenge',
            POSSIBLE_VALUE: '',
        },
        {
            NAME: 'code_verifier',
            POSSIBLE_VALUE: '',
            CHECKBOX_HIDDEN: true
        },
        {
            NAME: 'response_mode',
            POSSIBLE_VALUE: ['fragment','query'],
            ONLY_ONE: true
        },
        {
            NAME: 'state',
            POSSIBLE_VALUE: ''
        },
        {
            NAME: 'prompt',
            POSSIBLE_VALUE: ['consent','login'],
            ONLY_ONE: false
        },
        {
            NAME: 'login_hint',
            POSSIBLE_VALUE: '',
            PLACEHOLDER: 'name@example.com'
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
        'code'
    ],
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
        nonce,
        redirect_uri: 'http://localhost:5173/',
        response_type: 'code',
        code_challenge,
        code_verifier,
        response_mode: 'fragment',
        prompt: 'consent'
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
            HINT: [...PROVIDER_HINTS,'apple--','microsoft--','google-','email--','passkey--'].join(' '),
            ONLY_ONE: false,
        },
        {
            NAME: 'domain_hint',
            POSSIBLE_VALUE: '',
            HINT: 'personal | managed | domain.example',
            ONLY_ONE: true
        },
        {
            NAME: 'custom',
            POSSIBLE_VALUE: ''
        }
    ],
    
    // Hellō Dev Mode
    HELLO_EXTEND_PARAMS: [
        {
            NAME: 'passkeys',
            POSSIBLE_VALUE: '',
        }
    ],

    REQUIRED: [],
    DEFAULT_SELECTED: [],
    DEFAULT_VALUES: {
        passkeys: 'global'
    },

}

const PARAMS = {
    SCOPE_PARAM,
    PROTOCOL_PARAM,
    HELLO_PARAM
}

const SERVERS = [
    'https://wallet.hello.coop/authorize',
    'https://wallet.hello-beta.net/authorize'
]

const AUTHZ_SERVERS = {
    SERVERS,
    DEFAULT_SELECTED: SERVERS[0],

    // Hellō Dev Mode
    HELLO_EXTEND_SERVERS: [
        'https://wallet.hello-staging.net/authorize',
        'https://wallet.hello-local.net/authorize',
        'https://wallet.hello-dev.net/authorize',
    ],
}

export {
    PARAMS,
    AUTHZ_SERVERS
}