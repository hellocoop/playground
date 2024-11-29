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

function lineBreakUrl(url) {
    return url.replace(/&/g, '\n&').replace(/\?/g, '\n?')
}

export {
    cleanUrl,
    removeLoader,
    lineBreakUrl
}