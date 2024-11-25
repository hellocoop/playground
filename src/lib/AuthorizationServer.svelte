<script>
    import { AUTHZ_SERVERS } from '../constants.js'
</script>

<section>
    <legend class="font-medium text-base">Protocol Parameters</legend>
    <div class="flex">
        <ul class="space-y-2">
            {#each AUTHZ_SERVERS as server}
                {server}
            {/each}
        </ul>
    </div>
</section>