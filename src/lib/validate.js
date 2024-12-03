function validateScopes(scope, selectedScopes) {
    if (scope === 'profile') {
        if (['name', 'email', 'picture'].every(scope => selectedScopes.includes(scope))) return false
    } else if (['name', 'email', 'picture'].includes(scope)) {
        if (selectedScopes.includes('profile')) return false
    }
    return true;
}

function validateProtocolParams({
    param,
    protocolParams,
    protocolParamsValues,

}) {
    const { NAME } = param
    if (NAME === 'code_challenge') {
        // skip if response_type=id_token and code_challenge unselected
        const responseType = protocolParamsValues.response_type
        if (responseType === 'id_token') {
            const codeChallengeSelected = protocolParams.includes('code_challenge')
            if (!codeChallengeSelected) return true
        }
        // invalidate if no response_type=code
        const codeChallenge = protocolParams.includes('code_challenge')
        if (!codeChallenge) return false
        const responseTypeSelected = protocolParams.includes('response_type')
        if (!responseTypeSelected) return false;
        if (responseType !== 'code') return false;
    } else if (NAME === 'response_mode') {
        // invalidate if response_type=id_token and response_mode=query
        const responseTypeSelected = protocolParams.includes('response_type')
        const responseModeSelected = protocolParams.includes('response_mode')
        if (!responseTypeSelected || !responseModeSelected) return true;
        const responseType = protocolParamsValues.response_type
        const responseMode = protocolParamsValues.response_mode
        if (responseType === 'id_token' && responseMode === 'query') return false
    }
    return true;
}

export {
    validateScopes,
    validateProtocolParams
}