<script>
    import { PARAMS } from '../constants.js'
    import ChevronY from './ChevronY.svelte'
    import Tooltip from './Tooltip.svelte'

    let { selectedParams = $bindable(), selectedParamsValues = $bindable(), dropdowns = $bindable() } = $props()
</script>

<section class="break-inside-avoid-column">
    <button class="inline-flex items-center space-x-2" onclick={() => dropdowns.hello = !dropdowns.hello}>
        <span class="font-medium text-base">
            Hellō Parameters
        </span>
        <ChevronY dir={dropdowns.hello ? 'up' : 'down'}/>
        <Tooltip
            content='Hellō Parameters Docs',
            href='https://www.hello.dev/docs/oidc/request/#hellō-parameters'
        />
    </button>
    {#if dropdowns.hello}
        <ul class="flex flex-col justify-center mt-2 space-y-2">
            {#each PARAMS.HELLO_PARAM.PARAMS as pclParam}
                {@const required = PARAMS.HELLO_PARAM.REQUIRED.includes(pclParam.NAME)}
                <li class="flex flex-row items-start">
                    <div class="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id={pclParam.NAME}
                            name="scope"
                            bind:group={selectedParams}
                            value={pclParam.NAME}
                        />
                        <label for={pclParam.NAME} class="font-normal w-48">{pclParam.NAME} {required ? '*' : ''}</label>
                    </div>
                    <div class="flex flex-col w-full">
                        <input
                            type="text"
                            class="border w-full form-input h-6 px-2"
                            bind:value={selectedParamsValues[pclParam.NAME]}
                        />
                        {#if pclParam.PLACEHOLDER}
                            <p class="text-xs opacity-70 mt-1">{pclParam.PLACEHOLDER.join(' ')}</p>
                        {/if}
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</section>