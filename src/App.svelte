<script>
  import {onMount} from 'svelte'
  import Prism from 'svelte-prism'
  import makePKCE from './utils/pkce.js'

  let onMountDone = false

  onMount(()=>{
    getStatesFromLocalStorage()
    processFragmentOrQuery()
    onMountDone = true
  })

  const clientIds = {
    playground: '46be57a7-d0f5-459e-9655-24799433637d',
    greenfield: '3574f001-0874-4b20-bffd-8f3e37634274'
  }

  const scopes = {
    standard: ['openid', 'name', 'nickname', 'given_name', 'family_name', 'email', 'phone', 'picture'],
    custom: ['profile_update'],
    required: ['openid'],
    claims: ['name', 'nickname', 'given_name', 'family_name', 'email', 'phone', 'picture']
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
    required: ['client_id', 'redirect_uri', 'nonce', 'response_type']
  }

  //default values, also binds to user input
  let states = {
    auth_server: 'https://consent.hello.coop/',
    auth_servers: [],
    custom_auth_server: '',
    scopes: ['openid'],
    query_params: ['client_id', 'redirect_uri', 'nonce'],
    query_param_values: {
      ...queryParams.params,
      client_id: clientIds.playground,
      nonce: makeNonce(),
      redirect_uri: window.location.origin,
      response_mode: 'fragment',
      response_type: 'id_token',
      prompt: 'login'
    }
  }

  let cards = {
    response: false,
    payload: false,
    claims: false
  }

  let results = {
    response : '',
    payload: ''
  }

  //detect chanes in state -> save to local storage
  $: states, saveStatesToLocalStorage();

  async function processFragmentOrQuery(){
    if(!window.location.hash && !window.location.search) return
    let queryParams;
    if(window.location.hash){
      queryParams = new URLSearchParams(window.location.hash.substring(1))
      results.response = window.location.hash
    } else if(window.location.search){
      queryParams = new URLSearchParams(window.location.search)
      results.response = window.location.search
    }
    cards.response = true
    let id_token = queryParams.get('id_token')
    const code = queryParams.get('code')
    if(code){
      const res = await getToken(code)
      id_token = res.id_token
    }
    const payload = await getIntrospect(id_token)
    results.payload = payload
    cards.payload = cards.claims = true

    cleanURL()
  }

  function cleanURL(){
    if (window.location.search) {
      window.history.replaceState({}, document.title, '/');
    } else {
      window.location.replace('#');
      // slice off the remaining '#' in HTML5:
      if (typeof window.history.replaceState == 'function') {
        history.replaceState({}, '', window.location.href.slice(0, -1));
      }
    }
  }

  async function getToken(code){
    const params = {
      code,
      client_id: states.query_param_values.client_id,
      redirect_uri: states.query_param_values.redirect_uri,
      grant_type: 'authorization_code',
      code_verifier: states.query_param_values.code_verifier
    };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(params).toString()
    }
    const tokenEndpoint = new URL('/oauth/token', states.auth_server)
    try{
      const res = await fetch(tokenEndpoint, options)
      const json = await res.json()
      return json;
    } catch(err){
      console.error(err)
    }
  }

  async function getIntrospect(id_token){
    const introspectEndpoint = new URL('/oauth/introspect', states.auth_server)
    const params = {
      client_id: states.query_param_values.client_id,
      nonce: states.query_param_values.nonce,
      token: id_token
    };
    const options = {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: { 'Content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params).toString()
    };
    try{
      const res = await fetch(introspectEndpoint, options);
      const json = await res.json();
      return json;
    } catch(err){
      console.error(err)
    } finally{
      window.location.replace('#');
      // slice off the remaining '#' in HTML5:
      if (typeof window.history.replaceState == 'function') {
        history.replaceState({}, '', window.location.href.slice(0, -1));
      }
    }
  }

  function makeNonce(){
    const nonce = crypto
      .getRandomValues(new Uint32Array(2))
      .reduce((a, b) => b.toString() + a.toString())
    return nonce
  }

  function getStatesFromLocalStorage(){
    if(!localStorage.states) return;
    try{
      const _states = JSON.parse(localStorage.getItem('states'))
      states = _states
    } catch(err){
      console.error(err)
      localStorage.clear()
    }
  }

  function saveStatesToLocalStorage(){
    if(!onMountDone) return
    const _states = JSON.stringify(states)
    localStorage.setItem('states', _states)
  }

  function makeRequestURL(authServer, scopes, queryParams){
    try {
      const url = new URL(authServer)
      if(scopes.length){
        const _scopes = scopes.toString().replace(/,/g, ' ') //array of scopes to string separated by space
        url.searchParams.set('scope', _scopes)
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

<header class="flex-shrink-0 bg-charcoal text-gray h-12 flex items-center justify-between px-4 font-bold text-xl">
  <span class="w-1/3">Hellō</span>
  <span class="block w-1/3 flex justify-center">
    <img src="logo.svg" alt="Hellō Playground">
  </span>
  <div class="w-1/3 flex justify-end space-x-4">
    <a href="https://twitter.com/HelloCoop" target="_blank">
      <svg role="img" class="h-4 fill-gray" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
    </a>
    <a href="https://www.linkedin.com/company/HelloCoop" target="_blank">
      <svg role="img" class="h-4 fill-gray" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
    </a>

    <a href="https://github.com/hellocoop/" target="_blank">
      <svg role="img" class="h-4 fill-gray" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
    </a>
  </div>
</header>

<main class="p-4 space-y-4 flex-1 overflow-y-auto">
  <section class="border border-charcoal dark:border-gray-800 w-full p-4 flex items-start space-x-12">
   
    <div class="w-1/4 max-w-sm">
      <h1 class="font-semibold">Authorization Server</h1>
      
      <ul class="space-y-2 mt-2">
        <li class="flex items-center">
          <input
            type="radio"
            name="auth_servers"
            value="https://consent.hello.coop/"
            id="consent.hello.coop"
            class="text-charcoal form-radio"
            bind:group={states.auth_server}
          >
          <label for="consent.hello.coop" class="ml-2 w-full flex justify-between items-center">
            <span>https://consent.hello.coop/</span>
            <span>(production)</span>
          </label>
        </li>
        {#each states.auth_servers as server}
          <li class="flex items-center">
            <input
              type="radio"
              name="auth_servers"
              value={server}
              id={server}
              class="text-charcoal form-radio"
              bind:group={states.auth_server}
            >
            <label for={server} class="ml-2 w-full">{server}</label>
          </li>
        {/each}
        <li class="flex items-center">
          <input
            type="radio"
            name="auth_servers"
            value={states.custom_auth_server}
            class="text-charcoal form-radio"
            id="consent.hello.coop"
            bind:group={states.auth_server}
          >
          <input
            bind:value={states.custom_auth_server}
            on:input={e=>states.auth_server=e.target.value} type="url" name="custom"
            class="h-8 ml-2 w-full text-charcoal form-input" placeholder="eg http:/example.com:9000/"
          >
        </li>
      </ul>

      <div class="bg-gray-200 dark:bg-gray-800 p-4 break-words my-6">
        <h2 class="inline-flex items-center">
          <span>Request URL</span>
          <button on:click={async()=>{
            await navigator.clipboard.writeText(requestURL);
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </h2>
        <span class="mt-2 block text-sm whitespace-pre-line">
          {requestURL}
        </span>
      </div>

      <button on:click={()=>{
        try{
          const url = new URL(states.custom_auth_server)
          if(!['https://consent.hello.coop/', ...states.auth_servers].includes(url.href)){
            states.auth_servers = [...states.auth_servers, url.href]
            states.auth_server = url.href
            states.custom_auth_server = ''
          } 
        } catch{
          console.error('Custom auth server endpoint not saved locally: Invalid URL')
        } finally{
          window.location.href = requestURL
        }
      }} class="hello-btn-dark">ō Continue with Hellō</button>
    </div>

    <div class="w-1/4 max-w-xs">
      <h1 class="font-semibold">Scopes (* required)</h1>
      <div class="flex mt-2">
        <div class="w-1/2">
          <h2>Standard</h2>
          <ul class="space-y-2 mt-2">
            {#each scopes.standard as scope}
              {@const required = scopes.required.includes(scope)}
              <li class="flex items-center" class:text-red-500={required && !states.scopes.includes(scope)}>
                <input type="checkbox" class="text-charcoal form-checkbox" name={scope} id={scope} value={scope} bind:group={states.scopes}>
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
                <input type="checkbox" class="text-charcoal form-checkbox" name={scope} id={scope} value={scope} bind:group={states.scopes}>
                <label for={scope} class="ml-2">{scope}</label>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>

    <div class="flex-1 max-w-2xl">
      <h1 class="font-semibold">Query Params (* required)</h1>
      <div class="mt-2">
        <ul class="space-y-2 mt-2">
          {#each Object.entries(queryParams.params) as [scope, value]}
            {@const required = queryParams.required.includes(scope)}
            <li class="flex items-center relative">
              <div class="w-2/5 inline-flex items-center">
                {#if scope !== 'code_verifier'}
                  <input type="checkbox" class="text-charcoal form-checkbox" name={scope} id={scope} value={scope} bind:group={states.query_params}>
                {:else}
                  <span class="w-4"></span>
                {/if}
                <label
                  for={scope}
                  class="ml-2"
                  class:text-red-500={required && (!states.query_params.includes(scope) || !states.query_param_values[scope])}
                >
                  {scope} {required ? '*' : ''}
                </label>
              </div>
              {#if Array.isArray(value)}
                <div class="h-8 w-full border border-charcoal dark:border-gray-800 flex items-center rounded-sm"
                 class:opacity-60={!states.query_params.includes(scope)}
                >
                  {#each value as ele}
                    <button
                      on:click={()=>states.query_param_values[scope]=ele} class="w-1/2 h-7 mx-0.5"
                      class:bg-charcoal={states.query_param_values[scope] === ele}
                      class:text-gray={states.query_param_values[scope] === ele}
                    >
                        {ele}
                    </button>
                  {/each}
                </div>
              {:else}
                <div
                  class="flex flex-col w-full items-start"
                  class:opacity-60={!states.query_params.includes(scope) && scope !== 'code_verifier'}
                >
                  {#if scope === 'client_id'}
                    <div class="mb-0.5">
                      <button on:click={()=>states.query_param_values.client_id=clientIds.playground} class="text-sm underline">Playground</button>
                      <button on:click={()=>states.query_param_values.client_id=clientIds.greenfield} class="text-sm underline ml-2">GreenfieldFitness</button>
                    </div>
                  {/if}
                  <input type="text" name={scope} class="h-8 w-full form-input" bind:value={states.query_param_values[scope]}>
                  {#if scope === 'nonce'}
                    <button on:click={()=>states.query_param_values.nonce = makeNonce()} class="absolute right-1 bg-charcoal p-1 top-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 stroke-gray" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  {:else if scope === 'code_verifier'}
                    <button on:click={async()=>{
                      const { code_verifier, code_challenge } = await makePKCE()
                      states.query_param_values.code_verifier = code_verifier
                      states.query_param_values.code_challenge = code_challenge
                    }} class="absolute right-1 bg-charcoal p-1 top-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 stroke-gray" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  {/if}
                </div>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </section>

  <section class="border border-charcoal dark:border-gray-800">
    <button on:click={()=>cards.response=!cards.response} class="h-12 w-full flex justify-between items-center px-4"
      >
      <div class="inline-flex items-center">
        <span>Response</span>
        <button on:click={async()=>{
            cards.response = false
            await navigator.clipboard.writeText(results.response);
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
        class:rotate-180={cards.response}
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {#if cards.response}
      <p class="p-4 break-words">
        {#if results.response}
          {results.response}
        {:else}
         <p>Nothing to see here</p>
        {/if}
      </p>
    {/if}
  </section>

  <section class="border border-charcoal dark:border-gray-800">
    <button on:click={()=>cards.payload=!cards.payload} class="h-12 w-full flex justify-between items-center px-4">
      <div class="inline-flex items-center">
        <span>Payload</span>
        <button on:click={async()=>{
            cards.payload = false
            await navigator.clipboard.writeText(results.payload);
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
        class:rotate-180={cards.payload}
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {#if cards.payload}
      {#if results.payload}
        <Prism language="javascript">
          {JSON.stringify(results.payload,null,2)}
        </Prism>
      {:else}
        <p class="p-4">Nothing to see here</p>
      {/if}
    {/if}
  </section>

  <section class="border border-charcoal dark:border-gray-800">
    <button on:click={()=>cards.claims=!cards.claims} class="h-12 w-full flex justify-between items-center px-4"
    >
      <span>Claims</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
        class:rotate-180={cards.claims}
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {#if cards.claims}
      <ul class="flex flex-col px-4 divide-y">
        {#if results.payload}
          {#each scopes.claims as claim}
            <li class="py-4 flex items-center w-full">
              <div class="w-1/3">{claim}</div>
              <div>
                {#if claim === 'picture' && results.payload[claim]}
                  <img src={results.payload[claim]} class="h-10 w-10 rounded-full object-fit" alt="Picture"/>
                {:else}
                  {results.payload[claim] || ''}
                {/if}
              </div>
            </li>
          {/each}
        {:else}
          <p class="py-4">Nothing to see here</p>
        {/if}
      </ul>
    {/if}
  </section>
</main>

<wc-footer/>