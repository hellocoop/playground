function makeAuthzUrl({authzServer, scopes, params, paramsValues}) {
    const url = new URL('https://wallet.hello-dev.net/authorize')
    
    if (scopes.length)
        url.searchParams.set('scope', scopes.join(' '))

    for (const key in paramsValues) {
        // value exists but not selected
        if (!params.includes(key)) continue

        url.searchParams.set(key, paramsValues[key])
    }

    return url.href
}

function makeInviteUrl({authzServer, scopes, params, paramsValues}) {
    const url = new URL('https://wallet.hello-dev.net/authorize')

    url.pathname = '/invite'
    
    if (scopes.length)
        url.searchParams.set('scope', scopes.join(' '))

    for (const key in paramsValues) {
        // value exists but not selected
        if (!params.includes(key)) continue

        url.searchParams.set(key, paramsValues[key])
    }

    return url.href
}

function cleanUrl() {
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


function removeLoader() {
    document.getElementById('load-spinner')?.remove(); //remove spinner
}

export {
    makeAuthzUrl,
    makeInviteUrl,
    cleanUrl,
    removeLoader
}