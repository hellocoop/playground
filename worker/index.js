// playground.hello.dev Worker.
//
// Everything is served from static assets except POST /api/event, which the
// app uses to record Plausible pageviews (src/lib/utils.js sendPlausibleEvent).
// CloudFront used to proxy that path to plausible.io; this does the same.
// Plausible attributes the event using User-Agent and X-Forwarded-For.

const PLAUSIBLE_EVENT_URL = 'https://plausible.io/api/event';

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		if (url.pathname === '/api/event' && request.method === 'POST') {
			const headers = new Headers({ 'Content-Type': 'application/json' });
			const ua = request.headers.get('User-Agent');
			const ip = request.headers.get('CF-Connecting-IP');
			if (ua) headers.set('User-Agent', ua);
			if (ip) headers.set('X-Forwarded-For', ip);
			return fetch(PLAUSIBLE_EVENT_URL, { method: 'POST', headers, body: request.body });
		}
		return env.ASSETS.fetch(request);
	}
};
