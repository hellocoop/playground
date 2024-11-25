<script>
    import { slide } from 'svelte/transition'
    import { AUTHZ_SERVERS } from '../../constants.js'
    import ChevronY from '../ChevronY.svelte'

    let { dropdowns = $bindable() } = $props()
</script>

<section>
    <button class="inline-flex items-center space-x-2" onclick={() => dropdowns.server = !dropdowns.server}>
        <span class="font-medium text-base">
            Authorization Server
        </span>
        <ChevronY dir={dropdowns.server ? 'up' : 'down'}/>
    </button>
    {#if dropdowns.server}
        <div class="flex" transition:slide={{duration: 150}}>
            <ul class="space-y-2">
                {#each AUTHZ_SERVERS as server}
                    {server}
                {/each}
            </ul>
        </div>
    {/if}
</section>