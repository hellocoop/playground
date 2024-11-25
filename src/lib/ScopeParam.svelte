<script>
    import { PARAMS } from '../constants.js'
    let { selectedScopes = $bindable() } = $props()
</script>

<section>
    <legend class="font-medium text-base">Scope Parameter</legend>
    <div class="flex">
        <ul class="space-y-2">
            {#each PARAMS.SCOPE_PARAM.STANDARD as stdScope}
                {@const required = PARAMS.SCOPE_PARAM.REQUIRED.includes(stdScope)}
                <li class="flex flex-row items-center space-x-2">
                    <input
                        type="checkbox"
                        id={stdScope}
                        name="scope"
                        bind:group={selectedScopes}
                        value={stdScope}
                    />
                    <label for={stdScope} class="text-sm font-normal">{stdScope} {required ? '*' : ''}</label>
                </li>
            {/each}
        </ul>
    
        <ul class="space-y-2">
            {#each PARAMS.SCOPE_PARAM.NON_STANDARD as nonStdScope}
                <li class="flex flex-row items-start space-x-2">
                    <input
                        type="checkbox"
                        id={nonStdScope}
                        name="scope"
                        value={nonStdScope}
                        bind:group={selectedScopes}
                    />
                    <label for={nonStdScope} class="text-sm font-normal">{nonStdScope}</label>
                </li>
            {/each}
        </ul>
    </div>
</section>