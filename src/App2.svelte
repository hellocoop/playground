<script>
    import Header from './lib/Header.svelte'
    import { PARAMS, AUTHZ_SERVERS } from './constants.js'
</script>

<!-- <Header/> -->

{#each PARAMS.SCOPE_PARAM.STANDARD as stdScope}
    {stdScope}
{/each}

{#each PARAMS.SCOPE_PARAM.NON_STANDARD as nonStdScope}
    {nonStdScope}
{/each}