<script>
    import { onMount } from 'svelte'
    import { slide } from 'svelte/transition'
    import { PARAMS } from '../../constants.js'

    const { HELLO_PARAM: { PARAMS: HELLO_PARAMS } } = PARAMS;

    let { selected, value = $bindable(), isHelloMode } = $props()

    let debouncer = $state();
    let invalidSlugs = $state([]);

    onMount(validate)

    const DOMAIN_HINT = HELLO_PARAMS.find(i => i.NAME === 'domain_hint')
    function validate() {
        
    }  
</script>

<input
    type="text"
    class="border w-full form-input h-6 px-2"
    class:opacity-50={!selected}
    oninput={validate}
    bind:value={value}
/>

{#if invalidSlugs?.length}
    <p class="text-red-500 text-xs mt-2" transition:slide={{duration: 150}}>
        {invalidSlugs} {invalidSlugs.length > 1 ? 'are unsupported values' : 'is an unsupported value'}
    </p>
{/if}