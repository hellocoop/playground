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
        // value exists but not selected
        if (!ptlParams.includes(key)) continue

        url.searchParams.set(key, ptlParamsValues[key])
    }

    for (const key in helloParamsValues) {
        // value exists but not selected
        if (!helloParams.includes(key)) continue

        url.searchParams.set(key, helloParamsValues[key])
    }

    return url.href
}

function makeInviteUrl({authzServer}) {
    const url = new URL(authzServer)
    url.pathname = '/invite'
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