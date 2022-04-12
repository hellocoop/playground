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

  const states = {
    auth_server: 'https://consent.hello.coop/',
    custom_auth_server: '',
    scopes: []
  }

  const makeRequestURL = (authServer, scopes, queryParams) => {
    try {
      const url = new URL(authServer)
      if(scopes.length){
        const _scopes = scopes.toString().replace(/,/g, ' ') //array of scopes to string separated by space
        url.searchParams.set('scopes', _scopes)
      }
      const lineBreakedURL = url.toString().replace(/&/g, '\n&').replace(/\?/g, '\n?')
      return lineBreakedURL
    } catch(err){
      return 'Invalid URL'
    }
  }

  $: requestURL = makeRequestURL(states.auth_server, states.scopes)
</script>

<header class="bg-charcoal text-gray h-12 flex items-center justify-between px-4 font-bold text-xl">
  <span>Hellō</span>
  <span>Playground</span>
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
              <li class="flex items-center">
                <input type="checkbox" name={scope} id={scope} value={scope} bind:group={states.scopes}>
                <label for={scope} class="ml-2">{scope} {scopes.required.includes(scope) ? '*' : ''}</label>
              </li>
            {/each}
          </ul>
        </div>
        <div class="w-1/2">
          <h2>Custom</h2>
          <ul class="space-y-2 mt-2">
            {#each scopes.custom as scope}
              <li class="flex items-center">
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
          {#each Object.entries(queryParams.params) as [key, value]}
            <li class="flex items-center">
              <div class="w-2/5 inline-flex items-center">
                <input type="checkbox" name="client_id" id="client_id">
                <label for="client_id" class="ml-2">{key} {queryParams.required.includes(key) ? '*' : ''}</label>
              </div>
              {#if Array.isArray(value)}
                <div class="h-8 px-3 w-full border border-charcoal flex items-center">
                  {#each value as ele}
                    <button class="w-1/2">{ele}</button>
                  {/each}
                </div>
              {:else}
                <input type="text" name="client_id" class="h-8 w-full">
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </section>

  <section>
    <button class="border border-charcoal h-12 w-full flex justify-start items-center px-4">
      Response
    </button>
  </section>

  <section>
    <button class="border border-charcoal h-12 w-full flex justify-start items-center px-4">
      Payload
    </button>
  </section>

  <section>
    <button class="border border-charcoal h-12 w-full flex justify-start items-center px-4">
      Claims
    </button>
  </section>
</main>

<div class="fixed bottom-0 w-full">
  <wc-footer/>
</div>