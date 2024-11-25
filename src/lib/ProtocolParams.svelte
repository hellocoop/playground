<script>
    import { PARAMS } from '../constants.js'
    let { selectedParams = $bindable(), selectedParamsValues = $bindable(), dropdowns = $bindable() } = $props()
</script>

<section class="break-inside-avoid-column">
    <button class="font-medium text-base" onclick={() => dropdowns.protocol = !dropdowns.protocol}>Protocol Parameters</button>
    {#if dropdowns.protocol}
        <div class="flex">
            <ul class="space-y-2">
                {#each PARAMS.PROTOCOL_PARAM.PARAMS as pclParam}
                    {@const required = PARAMS.PROTOCOL_PARAM.REQUIRED.includes(pclParam.NAME)}
                    <li class="flex flex-row items-center space-x-2">
                        <input
                            type="checkbox"
                            id={pclParam.NAME}
                            name="scope"
                            bind:group={selectedParams}
                            value={pclParam.NAME}
                        />
                        <label for={pclParam.NAME} class="text-sm font-normal">{pclParam.NAME} {required ? '*' : ''}</label>
                        
                        {#if Array.isArray(pclParam.POSSIBLE_VALUE)}
                            {#each pclParam.POSSIBLE_VALUE as value}
                                {value}
                            {/each}
                        {:else}
                            <input type="text" class="border w-72" bind:value={selectedParamsValues[pclParam.NAME]} placeholder={pclParam.PLACEHOLDER}/>
                        {/if}
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</section>