// Check if EdDSA is supported in the current environment
async function isEdDSASupported() {
	try {
		await crypto.subtle.generateKey({ name: 'Ed25519' }, false, ['sign', 'verify']);
		return true;
	} catch (_) {
		return false;
	}
}

// Get existing keypair from storage or create a new one if missing
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
		// Check if EdDSA is supported, fallback to ECDSA if not
		const useEdDSA = await isEdDSASupported();
		let keyPair;

		if (useEdDSA) {
			keyPair = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
		} else {
			// Fallback to ECDSA P-256 for better browser compatibility
			keyPair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
				'sign',
				'verify'
			]);
		}

		const newPublicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
		const newPrivateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);

		// Store algorithm info with the keypair for later use
		localStorage.setItem(
			'dpop_keypair',
			JSON.stringify({
				publicKey: newPublicJwk,
				privateKey: newPrivateJwk,
				algorithm: useEdDSA ? 'EdDSA' : 'ES256'
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
	// Check if EdDSA is supported, fallback to ECDSA if not
	const useEdDSA = await isEdDSASupported();
	let keyPair;

	if (useEdDSA) {
		keyPair = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
	} else {
		// Fallback to ECDSA P-256 for better browser compatibility
		keyPair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
			'sign',
			'verify'
		]);
	}

	const publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
	const privateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);

	// Store algorithm info with the keypair for later use
	localStorage.setItem(
		'dpop_keypair',
		JSON.stringify({
			publicKey: publicJwk,
			privateKey: privateJwk,
			algorithm: useEdDSA ? 'EdDSA' : 'ES256'
		})
	);
	const thumbprint = await calculateJwkThumbprint(publicJwk);
	return thumbprint;
}

// Use jose library's thumbprint calculation to match server
async function calculateJwkThumbprint(jwk) {
	const { calculateJwkThumbprint: joseThumbprint } = await import('jose');
	// jose.calculateJwkThumbprint already returns a base64url-encoded string
	return await joseThumbprint(jwk);
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

export { generateDpopJkt, regenerateDpopJkt, getCurrentDpopJkt, calculateJwkThumbprint };
