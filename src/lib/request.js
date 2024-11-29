function makeAuthzUrl({
    authzServer,
    scopes,
    ptlParams,
    ptlParamsValues,
    helloParams,
    helloParamsValues
}) {
    const url = new URL(authzServer)
    
    if (scopes.length)
        url.searchParams.set('scope', scopes.join(' '))

    for (const key in ptlParamsValues) {
        // value exists
        if (!ptlParamsValues[key].length) continue;
        // param not selected
        if (!ptlParams.includes(key)) continue

        url.searchParams.set(key, ptlParamsValues[key])
    }

    for (const key in helloParamsValues) {
        // value exists
        if (!helloParamsValues[key].length) continue;
        // param not selected
        if (!helloParams.includes(key)) continue

        if (key === 'custom') {
            // interpret 'custom' value as param + value
            // i.e. custom='foo=bar&bar=foo' => '&foo=bar&bar=foo'
            const custom = new URLSearchParams(helloParamsValues[key]);
            for (const [key, value] of custom) {
                url.searchParams.set(key, value)
            }
            continue;
        } else {
            url.searchParams.set(key, helloParamsValues[key])
        }
    }

    return url.href
}

function makeInviteUrl({authzServer, claims, ptlParamsValues}) {
    const url = new URL('/invite', authzServer)
    url.searchParams.set('inviter', claims.sub)
    url.searchParams.set('client_id', ptlParamsValues.client_id)
    url.searchParams.set('initiate_login_uri', window.location.origin)
    url.searchParams.set('return_uri', window.location.origin)
    return url.href
}

export {
    makeAuthzUrl,
    makeInviteUrl
}