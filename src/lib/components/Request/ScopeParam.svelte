<script>
    import { slide } from 'svelte/transition'
    import { PARAMS } from '$lib/constants.js'
    import ChevronY from '$components/ChevronY.svelte'
    import Tooltip from '$components/Tooltip.svelte'

    let { selectedScopes = $bindable(), dropdowns = $bindable(), isHelloMode } = $props()
</script>

<section class="break-inside-avoid-column">
    <button class="inline-flex items-center space-x-2" onclick={() => dropdowns.scope = !dropdowns.scope}>
        <span class="font-medium text-base">
            Scope Parameter
        </span>
        <ChevronY dir={dropdowns.scope ? 'up' : 'down'}/>
        <Tooltip
            content='Scope Parameter Docs',
            href='https://www.hello.dev/docs/scopes/'
        />
    </button>
    {#if dropdowns.scope}
        {@const ALL_STANDARD_SCOEPS = [
            ...PARAMS.SCOPE_PARAM.STANDARD,
            ...(isHelloMode ? PARAMS.SCOPE_PARAM.HELLO_EXTEND_STANDARD : [])
        ]}
        {@const ALL_NON_STANDARD_SCOEPS = [
            ...PARAMS.SCOPE_PARAM.NON_STANDARD,
            ...(isHelloMode ? PARAMS.SCOPE_PARAM.HELLO_EXTEND_NON_STANDARD : [])
        ]}
        <div class="flex mt-2" transition:slide={{duration: 150}}>
            <ul class="space-y-2 w-48">
                {#each ALL_STANDARD_SCOEPS as stdScope}
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
        
            <ul class="space-y-2 w-48">
                {#each ALL_NON_STANDARD_SCOEPS as nonStdScope}
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