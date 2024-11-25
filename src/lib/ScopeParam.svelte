<script>
    import { slide } from 'svelte/transition'
    import { PARAMS } from '../constants.js'
    import ChevronY from './ChevronY.svelte'
    import Tooltip from './Tooltip.svelte'

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
        <div class="flex mt-2" transition:slide={{duration: 150}}>
            <ul class="space-y-2 w-48">
                {#each [
                    ...PARAMS.SCOPE_PARAM.STANDARD,
                    ...(isHelloMode ? HELLO_EXTEND_STANDARD : [])
                ] 
                as stdScope}
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
                {#each [
                        ...PARAMS.SCOPE_PARAM.NON_STANDARD,
                        ...(isHelloMode ? HELLO_EXTEND_NON_STANDARD : [])
                    ] 
                as nonStdScope}
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