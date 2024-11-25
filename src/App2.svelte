<script>
    import { PARAMS, AUTHZ_SERVERS } from './constants.js'
    import { json } from "./lib/utils.js"

    let selectedScopes = $state(PARAMS.SCOPE_PARAM.DEFAULT_SELECTED)
    
    //these are not the same since eg client_id can have value but not be selected
    let selectedParams = $state(Object.keys(PARAMS.PROTOCOL_PARAM.DEFAULT_SELECTED))
    let selectedParamsValues = $state(PARAMS.PROTOCOL_PARAM.DEFAULT_SELECTED)

    const authzUrl = $derived(makeAuthzUrl({
        authzServer: AUTHZ_SERVERS[0],
        scopes: selectedScopes,
        params: selectedParams,
        paramsValues: selectedParamsValues
    }))

    // save state to local storage
    // this runs everytime there is a state change
    $effect(saveStateToLocalStorage)

    function makeAuthzUrl({authzServer, scopes, params, paramsValues} = {}) {
        const url = new URL(authzServer)
        
        if (scopes.length)
            url.searchParams.set('scope', scopes.join(' '))

        for (const key in paramsValues) {
            // value exists but not selected
            if (!params.includes(key)) continue

            url.searchParams.set(key, paramsValues[key])
        }

        return url.href
    }

    function saveStateToLocalStorage() {
        const state = JSON.stringify({
            scopes: selectedScopes
        })
        localStorage.setItem('state', state)
    }
</script>

<main class="flex gap-10">
    <section>
        <legend class="font-medium text-base">Scope Parameter</legend>
        <div class="flex">
            <ul class="space-y-2">
                {#each PARAMS.SCOPE_PARAM.STANDARD as stdScope}
                    {@const required = PARAMS.SCOPE_PARAM.REQUIRED.includes(stdScope)}
                    <li class="flex flex-row items-center space-x-2">
                        <input
                            type="checkbox"
                            id={stdScope}
                            name="scope"
                            bind:group={selectedScopes}
                            value={stdScope}
                        />
                        <label for={stdScope} class="text-sm font-normal">{stdScope} {required ? '*' : ''}</label>
                    </li>
                {/each}
            </ul>
        
            <ul class="space-y-2">
                {#each PARAMS.SCOPE_PARAM.NON_STANDARD as nonStdScope}
                    <li class="flex flex-row items-start space-x-2">
                        <input
                            type="checkbox"
                            id={nonStdScope}
                            name="scope"
                            value={nonStdScope}
                            bind:group={selectedScopes}
                        />
                        <label for={nonStdScope} class="text-sm font-normal">{nonStdScope}</label>
                    </li>
                {/each}
            </ul>
        </div>
    </section>
    
    <section>
        <legend class="font-medium text-base">Protocol Parameters</legend>
        <div class="flex">
            <ul class="space-y-2">
                {#each PARAMS.PROTOCOL_PARAM.PARAMS as pclParam}
                    {@const required = PARAMS.PROTOCOL_PARAM.REQUIRED.includes(pclParam.NAME)}
                    <li class="flex flex-row items-center space-x-2">
                        <input
                            type="checkbox"
                            id={pclParam.NAME}
                            name="scope"
                            bind:group={selectedParams}
                            value={pclParam.NAME}
                        />
                        <label for={pclParam.NAME} class="text-sm font-normal">{pclParam.NAME} {required ? '*' : ''}</label>
                        
                        {#if Array.isArray(pclParam.POSSIBLE_VALUE)}
                            {#each pclParam.POSSIBLE_VALUE as value}
                                {value}
                            {/each}
                        {:else}
                            <input type="text" class="border w-72" bind:value={selectedParamsValues[pclParam.NAME]}/>
                        {/if}
                    </li>
                {/each}
            </ul>
        </div>
    </section>
</main>

{authzUrl}