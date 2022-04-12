<script>
  const scopes = {
    standard: ['openid', 'name', 'nickname', 'given_name', 'family_name', 'email', 'phone', 'picture'],
    custom: ['profile_update'],
    required: ['openid']
  }
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
          <input type="radio" name="consent.hello.coop" id="consent.hello.coop">
          <label for="consent.hello.coop" class="ml-2">https://consent.hello.coop/ <span>(production)</span></label>
        </li>
        <li class="flex items-center">
          <input type="radio" name="custom" id="consent.hello.coop">
          <input type="url" name="custom" class="h-8 ml-2 w-full">
        </li>
      </ul>

      <div class="bg-gray-200 p-4 break-words my-6">
        <h2>Request URL</h2>
        <span class="mt-2 block text-sm">
          https://consent.hello.coop/
          ?client_id=3574f001-0874-4b20-bffd-8f3e37634274
          &redirect_uri=https://playground.hello.dev
          &response_mode=fragment
          &response_type=code
          &nonce=28063994681536845045
          &scope=email+picture+openid
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
                <input type="checkbox" name={scope} id={scope}>
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
                <input type="checkbox" name={scope} id={scope}>
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
          <li class="flex items-center">
            <div class="w-2/5 inline-flex items-center">
              <input type="checkbox" name="client_id" id="client_id">
              <label for="client_id" class="ml-2">client_id *</label>
            </div>
            <input type="text" name="client_id" class="h-8 w-full">
          </li>
          <li class="flex items-center">
            <div class="w-2/5 inline-flex items-center">
              <input type="checkbox" name="client_id" id="client_id">
              <label for="client_id" class="ml-2">redirect_uri *</label>
            </div>
            <input type="text" name="client_id" class="h-8 w-full">
          </li>
          <li class="flex items-center">
            <div class="w-2/5 inline-flex items-center">
              <input type="checkbox" name="client_id" id="client_id">
              <label for="client_id" class="ml-2">response_mode</label>
            </div>
            <div class="h-8 px-3 w-full border border-charcoal flex items-center">
              <button class="bg-charcoal text-gray w-1/2">fragment</button>
              <button class="w-1/2">query</button>
            </div>
          </li>
          <li class="flex items-center">
            <div class="w-2/5 inline-flex items-center">
              <input type="checkbox" name="client_id" id="client_id">
              <label for="client_id" class="ml-2">response_type</label>
            </div>
            <div class="h-8 px-3 w-full border border-charcoal flex items-center">
              <button class="bg-charcoal text-gray w-1/2">code</button>
              <button class="w-1/2">id_token</button>
            </div>
          </li>
          <li class="flex items-center">
            <div class="w-2/5 inline-flex items-center">
              <input type="checkbox" name="client_id" id="client_id">
              <label for="client_id" class="ml-2">code_challenge</label>
            </div>
            <input type="text" name="client_id" class="h-8 w-full">
          </li>
          <li class="flex items-center">
            <div class="w-2/5 inline-flex items-center">
              <input type="checkbox" name="client_id" id="client_id">
              <label for="client_id" class="ml-2">code_verifier</label>
            </div>
            <input type="text" name="client_id" class="h-8 w-full">
          </li>
          <li class="flex items-center">
            <div class="w-2/5 inline-flex items-center">
              <input type="checkbox" name="client_id" id="client_id">
              <label for="client_id" class="ml-2">prompt</label>
            </div>
            <div class="h-8 px-3 w-full border border-charcoal flex items-center">
              <button class="bg-charcoal text-gray w-1/2">login</button>
              <button class="w-1/2">profile_update</button>
            </div>
          </li>
          <li class="flex items-center">
            <div class="w-2/5 inline-flex items-center">
              <input type="checkbox" name="client_id" id="client_id">
              <label for="client_id" class="ml-2">nonce *</label>
            </div>
            <input type="text" name="client_id" class="h-8 w-full">
          </li>
          <li class="flex items-center">
            <div class="w-2/5 inline-flex items-center">
              <input type="checkbox" name="client_id" id="client_id">
              <label for="client_id" class="ml-2">login_hint</label>
            </div>
            <input type="text" name="client_id" class="h-8 w-full">
          </li>
          <li class="flex items-center">
            <div class="w-2/5 inline-flex items-center">
              <input type="checkbox" name="client_id" id="client_id">
              <label for="client_id" class="ml-2">state</label>
            </div>
            <input type="text" name="client_id" class="h-8 w-full">
          </li>
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