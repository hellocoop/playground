// Generate an exportable ES256 keypair
async function generateDpopJkt() {
	const keyPair = await crypto.subtle.generateKey(
		{ name: 'ECDSA', namedCurve: 'P-256' },
		true, // extractable, so we can export to JWK
		['sign', 'verify']
	);
	const publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
	const privateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
	localStorage.setItem(
		'dpop_keypair',
		JSON.stringify({
			publicKey: publicJwk,
			privateKey: privateJwk
		})
	);
	// Compute RFC 7638 thumbprint (base64url-encoded SHA-256)
	const thumbprint = await calculateJwkThumbprint(publicJwk);
	return thumbprint;
}

// RFC 7638 thumbprint (ES256)
async function calculateJwkThumbprint(jwk) {
	// RFC 7638: only include required members in lexicographic order
	const fields = { crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y };
	const json = JSON.stringify(fields);
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(json));
	return base64urlEncode(new Uint8Array(digest));
}

// Base64url encode
function base64urlEncode(uint8) {
	return btoa(String.fromCharCode(...uint8))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

export { generateDpopJkt };
