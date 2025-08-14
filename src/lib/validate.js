function validateScopes(scope, selectedScopes, selectedProtocolParams, protocolParamsValues) {
	if (scope === 'dpop') {
		const dpopScopeSelected = selectedScopes.includes('dpop');
		const dpopJktSelected = selectedProtocolParams?.includes('dpop_jkt');

		// dpop scope should be red when dpop_jkt param is selected but dpop scope is not
		if (!dpopScopeSelected && dpopJktSelected) return false;

		// dpop scope should be red when it's selected but response_type is id_token (dpop only works with code flow)
		const responseType = protocolParamsValues?.response_type;
		if (dpopScopeSelected && responseType === 'id_token') return false;
	}
	return true;
}

function validateProtocolParams({
	param,
	protocolParams,
	protocolParamsValues,
	helloParams,
	helloParamsValues,
	selectedScopes
}) {
	const { NAME } = param;
	if (NAME === 'code_challenge') {
		// skip if response_type=id_token and code_challenge unselected
		const responseType = protocolParamsValues.response_type;
		if (responseType === 'id_token') {
			const codeChallengeSelected = protocolParams.includes('code_challenge');
			if (!codeChallengeSelected) return true;
		}
		// invalidate if no response_type=code
		const codeChallenge = protocolParams.includes('code_challenge');
		if (!codeChallenge) return false;
		const responseTypeSelected = protocolParams.includes('response_type');
		if (!responseTypeSelected) return false;
		if (responseType !== 'code') return false;
	} else if (NAME === 'response_mode') {
		// invalidate if response_type=id_token and response_mode=query
		const responseTypeSelected = protocolParams.includes('response_type');
		const responseModeSelected = protocolParams.includes('response_mode');
		if (!responseTypeSelected || !responseModeSelected) return true;
		const responseType = protocolParamsValues.response_type;
		const responseMode = protocolParamsValues.response_mode;
		if (responseType === 'id_token' && responseMode === 'query') return false;
	} else if (NAME === 'login_hint') {
		// invalidate if domain_hint is custom domain (not personal or managed)
		const loginHintSelected = protocolParams.includes('login_hint');
		const domainHintSelected = helloParams.includes('domain_hint');
		if (!loginHintSelected || !domainHintSelected) return true;
		const domainHint = helloParamsValues.domain_hint;
		if (!['personal', 'managed'].includes(domainHint.trim())) return false;
	} else if (NAME === 'dpop_jkt') {
		const dpopScopeSelected = selectedScopes?.includes('dpop');
		const dpopJktSelected = protocolParams.includes('dpop_jkt');

		// dpop_jkt param should be red when dpop scope is selected but dpop_jkt param is not
		if (dpopScopeSelected && !dpopJktSelected) return false;

		// dpop_jkt param should be red when it's selected but response_type is id_token (dpop only works with code flow)
		const responseType = protocolParamsValues?.response_type;
		if (dpopJktSelected && responseType === 'id_token') return false;
	}
	return true;
}

function validateHelloParams({ param, protocolParams, helloParams, helloParamsValues }) {
	const { NAME } = param;
	if (NAME === 'domain_hint') {
		// invalidate if domain_hint is custom domain (not personal or managed)
		const loginHintSelected = protocolParams.includes('login_hint');
		const domainHintSelected = helloParams.includes('domain_hint');
		if (!loginHintSelected || !domainHintSelected) return true;
		const domainHint = helloParamsValues.domain_hint;
		if (!['personal', 'managed'].includes(domainHint.trim())) return false;
	}
	return true;
}

async function validateAuthzServer(url) {
	const healthCheckUrl = new URL('/api/v1/health_check/playground', url).href;
	try {
		const res = await fetch(healthCheckUrl);
		return res.status === 200;
	} catch (error) {
		console.warn('Failed to validate', healthCheckUrl);
		return false;
	}
}

export { validateScopes, validateProtocolParams, validateHelloParams, validateAuthzServer };
