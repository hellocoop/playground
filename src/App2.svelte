<script>
    import Header from './lib/Header.svelte'
    import { PARAMS, AUTHZ_SERVERS } from './constants.js'
</script>

<Header/>

{#each PARAMS.SCOPE_PARAM.STANDARD as scope}
    {scope}
{/each}


