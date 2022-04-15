<script>
  import {onMount} from 'svelte'
  import Prism from 'svelte-prism'
  import makePKCE from './utils/pkce.js'

  let onMountDone = false

  onMount(()=>{
    getStatesFromLocalStorage()
    processFragmentOrQuery()
    updateFavicon()
    onMountDone = true
  })

  const navLinks = [
    {
      text: 'Documentation',
      link: 'https://hello.dev/documentation/'
    },
    {
      text: 'FAQs',
      link: 'https://hello.dev/faqs/'
    },
    {
      text: 'Pricing',
      link: 'https://hello.dev/pricing/'
    },
    {
      text: 'Console',
      link: 'https://console.hello.dev/'
    }
  ]

  const clientIds = {
    playground: '46be57a7-d0f5-459e-9655-24799433637d',
    greenfield: '3574f001-0874-4b20-bffd-8f3e37634274'
  }

  const scopes = {
    standard: ['openid', 'name', 'nickname', 'given_name', 'family_name', 'email', 'phone', 'picture'],
    custom: ['profile_update'],
    required: ['openid'],
    claims: ['sub', 'name', 'nickname', 'given_name', 'family_name', 'email', 'phone', 'picture']
  }

  const queryParams = {
    params: {
      client_id: '',
      nonce: '',
      redirect_uri: '',
      response_type: ['code', 'id_token'],
      code_challenge: '',
      code_verifier: '',
      login_hint: '',
      prompt: ['login', 'profile_update'],
      response_mode: ['fragment', 'query'],
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

  let copyStates = {
    requestURL: false,
    response: false,
    payload: false
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

  function updateFavicon(){
    const ref = document.querySelector("link[rel='icon']");
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      ref.href = 'dark-favicon.png';
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      if (event.matches) {
        ref.href = 'light-favicon.png';
      } else {
        ref.href = 'dark-favicon.png';
      }
    });
  }

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
      try{
        const res = await getToken(code)
        id_token = res.id_token
      } catch(err){
        results.payload = err
        cards.payload = true
      }
    }

    if(id_token){
      const payload = await getIntrospect(id_token)
      results.payload = payload
      cards.payload = cards.claims = true
    }

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
      if(res.status !== 200 || !res.ok) throw json
      return json;
    } catch(err){
      throw err;
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
      //url
      console.log(Object.keys(queryParams.params))
      return url
    } catch(err){
      return 'Invalid URL'
    }
  }

  async function copy(state, content){
    copyStates[state] = true
    await navigator.clipboard.writeText(content);
    setTimeout(()=>{
      copyStates[state] = false
    }, 500)
  }

  async function handleCheckboxInput(e, param){
    if(param === 'nonce'){
      if(e.target.checked){
        states.query_param_values.nonce = makeNonce()
      } else{
        states.query_param_values.nonce = ''
      }
    }

    if(param === 'code_challenge'){
      if(e.target.checked){
        const { code_challenge, code_verifier } = await makePKCE()
        states.query_param_values.code_challenge = code_challenge
        states.query_param_values.code_verifier = code_verifier
      } else{
        states.query_param_values.code_challenge = states.query_param_values.code_verifier = ''
      }
    }

    if(param === 'response_mode'){
      if(!e.target.checked){
        states.query_param_values.response_mode = 'fragment'
      }
    }

    if(param === 'prompt'){
      if(!e.target.checked){
        states.query_param_values.prompt = 'login'
      }
    }
  }

  $: requestURL = makeRequestURL(states.auth_server, states.scopes, states.query_params)
</script>

<header class="flex-shrink-0 bg-charcoal text-gray h-12 flex items-center justify-between px-4 font-bold text-lg">
  <span class="w-1/3">Hellō</span>
  <span class="block w-1/3 flex justify-center">
    <img src="logo.svg" alt="Hellō Playground">
  </span>
  <div class="w-1/3 flex justify-end space-x-4">
    <ul class="flex space-x-4">
      {#each navLinks as { text, link }}
        <li class="nav-link text-sm font-medium relative">
          <a href={link} target="_blank" class="inline-flex items-center">
            {text}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3 ml-1 mt-0.5 opacity-80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </li>
      {/each}
    </ul>
  </div>
</header>

<main class="p-4 space-y-4 flex-1 overflow-y-auto">
  <section class="border border-charcoal dark:border-gray-800 w-full p-4 flex items-start flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-12">
    <div class="w-full md:w-1/4 md:max-w-sm md:min-w-[23rem]">
      <h1 class="font-semibold text-lg">Authorization Server</h1>
      
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
          <button on:click={()=>copy('requestURL', requestURL)}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </h2>
        <span class="mt-2 block text-sm whitespace-pre-line" class:flash={copyStates.requestURL}>
          {@html requestURL}
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
      }} class="hello-btn-dark w-full hidden md:block">ō&nbsp;&nbsp;&nbsp;Continue with Hellō</button>
    </div>

    <div class="w-full md:w-1/4 md:max-w-xs">
      <h1 class="font-semibold text-lg">Scopes (* required)</h1>
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

    <div class="flex-1 max-w-[50rem]">
      <h1 class="font-semibold text-lg">Query Params (* required)</h1>
      <div class="mt-2">
        <ul class="space-y-2 mt-2">
          {#each Object.entries(queryParams.params) as [param, value]}
            {@const required = queryParams.required.includes(param)}
            <li class="flex items-center relative">
              <div class="w-2/5 inline-flex items-center"
                class:mt-6={param === 'client_id'}
              >
                {#if param !== 'code_verifier'}
                  <input type="checkbox" bind:group={states.query_params} on:change={(e)=>handleCheckboxInput(e, param)} class="text-charcoal form-checkbox" name={param} id={param} value={param}>
                {:else}
                  <span class="w-4"></span>
                {/if}
                <label
                  for={param}
                  class="ml-2"
                  class:text-red-500={required && (!states.query_params.includes(param) || !states.query_param_values[param])}
                >
                  {param} {required ? '*' : ''}
                </label>
              </div>
              {#if Array.isArray(value)}
                <div class="h-8 w-full border border-charcoal dark:border-gray-800 flex items-center rounded-sm"
                 class:opacity-60={!states.query_params.includes(param) && param !== 'response_mode' && param !== 'prompt'}
                >
                  {#each value as ele}
                    <button
                      on:click={()=>states.query_param_values[param]=ele} class="w-1/2 h-7 mx-0.5"
                      class:bg-charcoal={states.query_param_values[param] === ele}
                      class:text-gray={states.query_param_values[param] === ele}
                    >
                        {ele}
                    </button>
                  {/each}
                </div>
              {:else}
                <div
                  class="flex flex-col w-full items-start"
                  class:opacity-60={!states.query_params.includes(param) && param !== 'code_challenge'}
                >
                  {#if param === 'client_id'}
                    <div class="mb-0.5">
                      <button on:click={()=>states.query_param_values.client_id=clientIds.playground} class="text-sm underline">Playground</button>
                      <button on:click={()=>states.query_param_values.client_id=clientIds.greenfield} class="text-sm underline ml-2">GreenfieldFitness</button>
                    </div>
                  {/if}
                  <input type="text" name={param} class="h-8 w-full form-input" bind:value={states.query_param_values[param]}>
                </div>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
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
    }} class="hello-btn-dark w-full md:hidden">ō&nbsp;&nbsp;&nbsp;Continue with Hellō</button>
  </section>

  <section class="border border-charcoal dark:border-gray-800">
    <button on:click={()=>cards.response=!cards.response} class="h-12 w-full flex justify-between items-center px-4"
      >
      <div class="inline-flex items-center">
        <span class="font-semibold text-lg">Response</span>
        <button on:click={()=>{
          if(!results.response) return
          cards.response = false;
          copy('response', results.response)}
        }>
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
          <span class:flash={copyStates.response}>{results.response}</span>
        {:else}
         <p>Nothing to see here</p>
        {/if}
      </p>
    {/if}
  </section>

  <section class="border border-charcoal dark:border-gray-800">
    <button on:click={()=>cards.payload=!cards.payload} class="h-12 w-full flex justify-between items-center px-4">
      <div class="inline-flex items-center">
        <span class="font-semibold text-lg">Payload</span>
        <button on:click={()=>{
          if(!results.payload) return
          cards.payload = false;
          copy('payload', results.payload)
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
        <span class:flash={copyStates.payload}>
          <Prism language="javascript">
            {JSON.stringify(results.payload,null,2)}
          </Prism>
        </span>
      {:else}
        <p class="p-4">Nothing to see here</p>
      {/if}
    {/if}
  </section>

  <section class="border border-charcoal dark:border-gray-800">
    <button on:click={()=>cards.claims=!cards.claims} class="h-12 w-full flex justify-between items-center px-4"
    >
      <span class="font-semibold text-lg">Claims</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
        class:rotate-180={cards.claims}
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {#if cards.claims}
      <ul class="flex flex-col px-4 divide-y">
        {#if results.payload && !results.payload.error}
          {#each scopes.claims.filter(i=>results.payload[i]) as claim}
            <li class="py-4 flex items-center w-full">
              <div class="w-1/3">{claim}</div>
              <div>
                {#if claim === 'picture' && results.payload[claim]}
                  <!-- svelte-ignore a11y-img-redundant-alt -->
                  <img src={results.payload[claim]} class="h-10 w-10 rounded-full object-fit" alt="Picture claim"/>
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

<style>
  .nav-link:hover::after {
    width: 100%;
    content: ' ';
    height: 2px;
    background-color: white;
    display: inline-block;
    position: absolute;
    bottom: -4px;
    left: 0;
  }

  .flash{
    animation: flash-animation 0.5s ease-in-out;
  }

  @keyframes flash-animation {
    0% {
      opacity: 1;
    }
    50%{
      opacity: 0.5;
    }
    100%{
      opacity: 1;
    }
  }
</style>
