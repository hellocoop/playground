<script>
  const scopes = {
    standard: ['openid', 'name', 'nickname', 'given_name', 'family_name', 'email', 'phone', 'picture'],
    custom: ['profile_update'],
    required: ['openid']
  }

  const queryParams = {
    params: {
      client_id: '',
      redirect_uri: '',
      response_mode: ['fragment', 'query'],
      response_type: ['code', 'id_token'],
      code_challenge: '',
      code_verifier: '',
      prompt: ['login', 'profile_update'],
      nonce: '',
      login_hint: '',
      state: ''
    },
    required: ['client_id', 'redirect_uri', 'nonce']
  }

  //default values, also binds to user input
  const states = {
    auth_server: 'https://consent.hello.coop/',
    custom_auth_server: '',
    scopes: ['openid'],
    query_params: ['client_id', 'redirect_uri', 'nonce'],
    query_param_values: {
      ...queryParams.params,
      response_mode: 'fragment',
      response_type: 'id_token',
      prompt: 'login'
    },
    cards: {
      response: false,
      payload: false,
      claims: false
    }
  }

  const makeRequestURL = (authServer, scopes, queryParams) => {
    try {
      const url = new URL(authServer)
      if(scopes.length){
        const _scopes = scopes.toString().replace(/,/g, ' ') //array of scopes to string separated by space
        url.searchParams.set('scopes', _scopes)
      }
      if(queryParams.length){
        for(const param of queryParams){
          const query_param_value = states.query_param_values[param]
          if(!query_param_value) continue;
          url.searchParams.set(param, query_param_value)
        }
      }
      const lineBreakedURL = url.toString().replace(/&/g, '\n&').replace(/\?/g, '\n?')
      return lineBreakedURL
    } catch(err){
      return 'Invalid URL'
    }
  }

  $: requestURL = makeRequestURL(states.auth_server, states.scopes, states.query_params)
</script>

<header class="bg-charcoal text-gray h-12 flex items-center justify-between px-4 font-bold text-xl">
  <span>Hellō</span>
  <span>
    <img src="logo.svg" alt="Hellō Playground">
  </span>
  <span>Links</span>
</header>

<main class="p-4 space-y-4">
  <section class="border border-charcoal w-full p-4 flex items-start space-x-12">
   
    <div class="w-1/5">
      <h1 class="font-semibold">Authorization Server</h1>
      
      <ul class="space-y-2 mt-2">
        <li class="flex items-center">
          <input
            type="radio"
            name="auth_servers"
            value="https://consent.hello.coop/"
            id="consent.hello.coop"
            bind:group={states.auth_server}
          >
          <label for="consent.hello.coop" class="ml-2 w-full flex justify-between items-center">
            <span>https://consent.hello.coop/</span>
            <span>(production)</span>
          </label>
        </li>
        <li class="flex items-center">
          <input
            type="radio"
            name="auth_servers"
            value={states.custom_auth_server}
            id="consent.hello.coop"
            bind:group={states.auth_server}
          >
          <input
            bind:value={states.custom_auth_server}
            on:input={e=>states.auth_server=e.target.value} type="url" name="custom"
            class="h-8 ml-2 w-full" placeholder="eg http:/example.com:9000/"
          >
        </li>
      </ul>

      <div class="bg-gray-200 p-4 break-words my-6">
        <h2>Request URL</h2>
        <span class="mt-2 block text-sm whitespace-pre-line">
          {requestURL}
        </span>
      </div>

      <button class="hello-btn-dark">ō Continue with Hellō</button>
    </div>

    <div class="w-1/5">
      <h1 class="font-semibold">Scopes (* required)</h1>
      <div class="flex mt-2">
        <div class="w-1/2">
          <h2>Standard</h2>
          <ul class="space-y-2 mt-2">
            {#each scopes.standard as scope}
              {@const required = scopes.required.includes(scope)}
              <li class="flex items-center" class:text-red-500={required && !states.scopes.includes(scope)}>
                <input type="checkbox" name={scope} id={scope} value={scope} bind:group={states.scopes}>
                <label for={scope} class="ml-2">{scope} {required ? '*' : ''}</label>
              </li>
            {/each}
          </ul>
        </div>
        <div class="w-1/2">
          <h2>Custom</h2>
          <ul class="space-y-2 mt-2">
            {#each scopes.custom as scope}
              {@const required = scopes.required.includes(scope)}
              <li
                class="flex items-center"
                class:text-red-500={required && !states.scopes.includes(scope)}
              >
                <input type="checkbox" name={scope} id={scope} value={scope} bind:group={states.scopes}>
                <label for={scope} class="ml-2">{scope}</label>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>

    <div class="w-1/3">
      <h1 class="font-semibold">Query Params (* required)</h1>
      <div class="mt-2">
        <ul class="space-y-2 mt-2">
          {#each Object.entries(queryParams.params) as [scope, value]}
            {@const required = queryParams.required.includes(scope)}
            <li class="flex items-center" class:text-red-500={required && !states.query_params.includes(scope)}>
              <div class="w-2/5 inline-flex items-center">
                <input type="checkbox" name={scope} id={scope} value={scope} bind:group={states.query_params}>
                <label for={scope} class="ml-2">{scope} {required ? '*' : ''}</label>
              </div>
              {#if Array.isArray(value)}
                <div class="h-8 px-3 w-full border border-charcoal flex items-center">
                  {#each value as ele}
                    <button
                      on:click={()=>states.query_param_values[scope]=ele} class="w-1/2"
                      class:bg-charcoal={states.query_param_values[scope] === ele}
                      class:text-gray={states.query_param_values[scope] === ele}
                    >
                        {ele}
                    </button>
                  {/each}
                </div>
              {:else}
                <input type="text" name={scope} class="h-8 w-full" bind:value={states.query_param_values[scope]}>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </section>

  <section>
    <button on:click={()=>states.cards.response=!states.cards.response} class="border border-charcoal h-12 w-full flex justify-start items-center px-4">
      Response
    </button>
    {#if states.cards.response}
      asdf
    {/if}
  </section>

  <section>
    <button on:click={()=>states.cards.payload=!states.cards.payload} class="border border-charcoal h-12 w-full flex justify-start items-center px-4">
      Payload
    </button>
    {#if states.cards.payload}
      asdf
    {/if}
  </section>

  <section>
    <button on:click={()=>states.cards.claims=!states.cards.claims} class="border border-charcoal h-12 w-full flex justify-start items-center px-4">
      Claims
    </button>
    {#if states.cards.claims}
      asdf
    {/if}
  </section>
</main>

<div class="fixed bottom-0 w-full">
  <wc-footer/>
</div>