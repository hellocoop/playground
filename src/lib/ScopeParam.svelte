<script>
    import { PARAMS } from '../constants.js'
    let { selectedScopes = $bindable(), dropdowns = $bindable() } = $props()
</script>

<section class="break-inside-avoid-column">
    <button class="font-medium text-base" onclick={() => dropdowns.scope = !dropdowns.scope}>Scope Parameter</button>
    {#if dropdowns.scope}
        <div class="flex mt-2">
            <ul class="space-y-2 w-44">
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
                        <label for={stdScope}>{stdScope} {required ? '*' : ''}</label>
                    </li>
                {/each}
            </ul>
        
            <ul class="space-y-2 w-44">
                {#each PARAMS.SCOPE_PARAM.NON_STANDARD as nonStdScope}
                    <li class="flex flex-row items-center space-x-2">
                        <input
                            type="checkbox"
                            id={nonStdScope}
                            name="scope"
                            value={nonStdScope}
                            bind:group={selectedScopes}
                        />
                        <label for={nonStdScope} class="italic">{nonStdScope}</label>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</section>