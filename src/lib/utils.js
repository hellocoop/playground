import { tick } from 'svelte';
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

const plausibleIgnore =
	localStorage.getItem('plausible_ignore') == 'true' ||
	window.location.origin !== 'https://playground.hello.dev';

async function sendPlausibleEvent() {
	if (plausibleIgnore) {
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

async function focusAuthzResponseSection() {
	await tick(); // ensures UI updates are complete
	const ele = document.querySelector('#authz-response-container');
	if (ele) ele.scrollIntoView();
}

export {
	cleanUrl,
	removeLoader,
	lineBreakUrl,
	reset,
	handleLegacyState,
	generatePkce,
	sendPlausibleEvent,
	focusAuthzResponseSection
};
