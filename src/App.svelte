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
  <span class="w-1/3">Hellō</span>
  <span class="block w-1/3 flex justify-center">
    <img src="logo.svg" alt="Hellō Playground">
  </span>
  <div class="w-1/3 flex justify-end space-x-4">
    <svg role="img" class="h-4 fill-gray" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
      
    <svg role="img" class="h-4 fill-gray" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>

    <svg role="img" class="h-4 fill-gray" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
  </div>
</header>

<main class="p-4 space-y-4">
  <section class="border border-charcoal dark:border-gray-800 w-full p-4 flex items-start space-x-12">
   
    <div class="w-1/5">
      <h1 class="font-semibold">Authorization Server</h1>
      
      <ul class="space-y-2 mt-2">
        <li class="flex items-center">
          <input
            type="radio"
            name="auth_servers"
            value="https://consent.hello.coop/"
            id="consent.hello.coop"
            class="text-charcoal"
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
            class="text-charcoal"
            id="consent.hello.coop"
            bind:group={states.auth_server}
          >
          <input
            bind:value={states.custom_auth_server}
            on:input={e=>states.auth_server=e.target.value} type="url" name="custom"
            class="h-8 ml-2 w-full text-charcoal" placeholder="eg http:/example.com:9000/"
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
                <input type="checkbox" class="text-charcoal" name={scope} id={scope} value={scope} bind:group={states.scopes}>
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
                <input type="checkbox" class="text-charcoal" name={scope} id={scope} value={scope} bind:group={states.scopes}>
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
                <input type="checkbox" class="text-charcoal" name={scope} id={scope} value={scope} bind:group={states.query_params}>
                <label for={scope} class="ml-2">{scope} {required ? '*' : ''}</label>
              </div>
              {#if Array.isArray(value)}
                <div class="h-8 px-3 w-full border border-charcoal dark:border-gray-800 flex items-center">
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
    <button on:click={()=>states.cards.response=!states.cards.response} class="border border-charcoal dark:border-gray-800 h-12 w-full flex justify-start items-center px-4">
      Response
    </button>
    {#if states.cards.response}
      asdf
    {/if}
  </section>

  <section>
    <button on:click={()=>states.cards.payload=!states.cards.payload} class="border border-charcoal dark:border-gray-800 h-12 w-full flex justify-start items-center px-4">
      Payload
    </button>
    {#if states.cards.payload}
      asdf
    {/if}
  </section>

  <section>
    <button on:click={()=>states.cards.claims=!states.cards.claims} class="border border-charcoal dark:border-gray-800 h-12 w-full flex justify-start items-center px-4">
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