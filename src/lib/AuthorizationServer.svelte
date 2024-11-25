<script>
    import { AUTHZ_SERVERS } from '../constants.js'
    let { dropdowns = $bindable() } = $props()
</script>

<section>
    <button class="font-medium text-base" onclick={() => dropdowns.server = !dropdowns.server}>Authorization Server</button>
    {#if dropdowns.server}
        <div class="flex">
            <ul class="space-y-2">
                {#each AUTHZ_SERVERS as server}
                    {server}
                {/each}
            </ul>
        </div>
    {/if}
</section>