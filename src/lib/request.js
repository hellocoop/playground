function makeAuthzUrl({
	authzServer,
	customAuthzServer = null,
	scopes,
	customScope = null,
	protocolParams,
	protocolParamsValues,
	helloParams,
	helloParamsValues
}) {
	try {
		const server = authzServer === 'custom-authz-server' ? customAuthzServer : authzServer;
		const url = new URL(server);

		// scope is not overridden in protocol params section
		if (scopes.length && !protocolParams.includes('scope')) {
			let scopesStr = scopes.join(' ');
			// replace 'custom-scope' key w/ custom scope value
			scopesStr = scopesStr.replace('custom-scope', customScope);
			// trim whitespace at ends so there is no trailing '+'
			scopesStr = scopesStr.trim();
			url.searchParams.set('scope', scopesStr);
		}

		for (const key in protocolParamsValues) {
			// value exists
			if (!protocolParamsValues[key].length) continue;
			// param not selected
			if (!protocolParams.includes(key)) continue;

			const value = protocolParamsValues[key];
			if (Array.isArray(value)) {
				// value of prompt is array [consent,login]
				url.searchParams.set(key, protocolParamsValues[key].join(' '));
			} else {
				url.searchParams.set(key, protocolParamsValues[key].trim());
			}
		}

		for (const key in helloParamsValues) {
			// value exists
			if (!helloParamsValues[key].length) continue;
			// param not selected
			if (!helloParams.includes(key)) continue;

			if (key === 'custom') {
				// interpret 'custom' value as param + value
				// i.e. custom='foo=bar&bar=foo' => '&foo=bar&bar=foo'
				const custom = new URLSearchParams(helloParamsValues[key]);
				for (const [key, value] of custom) {
					url.searchParams.set(key, value.trim());
				}
				continue;
			} else {
				url.searchParams.set(key, helloParamsValues[key].trim());
			}
		}

		return url.href;
	} catch (err) {
		// do nothing with err since common flow
		// (user can enter custom authz server url)
		return 'Invalid URL';
	}
}

function makeInviteUrl({ authzServer, claims, protocolParamsValues }) {
	const url = new URL('/invite', authzServer);
	url.searchParams.set('inviter', claims.sub);
	url.searchParams.set('client_id', protocolParamsValues.client_id);
	url.searchParams.set('initiate_login_uri', window.location.origin);
	url.searchParams.set('return_uri', window.location.origin);
	return url.href;
}

export { makeAuthzUrl, makeInviteUrl };
