import { createAuthRequest } from '@hellocoop/helper-browser';

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
	return url.replace(/&/g, '\n&').replace(/\?/g, '\n?');
}

function reset() {
	localStorage.removeItem('states');
	window.location.reload();
}

function handleLegacyState() {
	// move old state to new var just in case we need it later
	localStorage.setItem('_legacy_states', localStorage.getItem('states'));
	// remove old state and reload
	return reset();
}

async function generatePkce() {
	try {
		const { url, nonce, code_verifier } = await createAuthRequest({
			// we just need nonce & code_verifier
			client_id: 'x',
			redirect_uri: 'x'
		});
		// because helper-browser only returns code_verifier in url
		const code_challenge = new URL(url).searchParams.get('code_challenge');
		return {
			nonce,
			code_verifier,
			code_challenge
		};
	} catch (err) {
		console.error(err);
	}
}

export { cleanUrl, removeLoader, lineBreakUrl, reset, handleLegacyState, generatePkce };
