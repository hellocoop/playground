const makePKCE = async() => {
	const code_verifier = generateRandomString()
	const code_challenge = await pkceChallengeFromVerifier(code_verifier)
	return {
		code_verifier,
		code_challenge
	}
}

const pkceChallengeFromVerifier = async(v) => {
	let hashed = await sha256(v);
	return base64urlencode(hashed);
}

const generateRandomString = () => {
  const array = new Uint32Array(28)
  window.crypto.getRandomValues(array)
  return Array.from(array, (dec) => ('0' + dec.toString(16)).substr(-2)).join('')
}

const makeNonce = () => {
	const nonce = crypto
		.getRandomValues(new Uint32Array(2))
		.reduce((a, b) => b.toString() + a.toString())
	return nonce
}

const sha256 = (plain) => {
	const encoder = new TextEncoder();
	const data = encoder.encode(plain);
	return window.crypto.subtle.digest('SHA-256', data);
}

// Base64-urlencodes the input string
const base64urlencode = (str) => {
	// Convert the ArrayBuffer to string using Uint8 array to conver to what btoa accepts.
	// btoa accepts chars only within ascii 0-255 and base64 encodes them.
	// Then convert the base64 encoded to base64url encoded
	//   (replace + with -, replace / with _, trim trailing =)
	return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

export default makePKCE