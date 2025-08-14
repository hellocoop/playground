// Get existing ES256 keypair from storage or create a new one if missing
async function generateDpopJkt() {
	let stored = null;
	try {
		stored = JSON.parse(localStorage.getItem('dpop_keypair'));
	} catch (_) {
		// ignore parse errors and create a new key
	}

	let publicJwk;
	if (stored?.publicKey && stored?.privateKey) {
		publicJwk = stored.publicKey;
	} else {
		const keyPair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
			'sign',
			'verify'
		]);
		const newPublicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
		const newPrivateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
		localStorage.setItem(
			'dpop_keypair',
			JSON.stringify({
				publicKey: newPublicJwk,
				privateKey: newPrivateJwk
			})
		);
		publicJwk = newPublicJwk;
	}

	// Compute RFC 7638 thumbprint (base64url-encoded SHA-256)
	const thumbprint = await calculateJwkThumbprint(publicJwk);
	return thumbprint;
}

// Explicitly rotate the DPoP keypair and return the new jkt
async function regenerateDpopJkt() {
	const keyPair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
		'sign',
		'verify'
	]);
	const publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
	const privateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
	localStorage.setItem(
		'dpop_keypair',
		JSON.stringify({
			publicKey: publicJwk,
			privateKey: privateJwk
		})
	);
	const thumbprint = await calculateJwkThumbprint(publicJwk);
	return thumbprint;
}

// Use jose library's thumbprint calculation to match server
async function calculateJwkThumbprint(jwk) {
	const { calculateJwkThumbprint: joseThumbprint, base64url } = await import('jose');
	const thumbprint = await joseThumbprint(jwk);
	return base64url.encode(thumbprint);
}

async function getCurrentDpopJkt() {
	try {
		const stored = JSON.parse(localStorage.getItem('dpop_keypair'));
		if (!stored?.publicKey) return null;
		return await calculateJwkThumbprint(stored.publicKey);
	} catch (_) {
		return null;
	}
}

export { generateDpopJkt, regenerateDpopJkt, getCurrentDpopJkt };
