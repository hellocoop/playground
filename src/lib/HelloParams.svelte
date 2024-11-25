<script>
    import { PARAMS } from '../constants.js'
    let { selectedParams = $bindable(), selectedParamsValues = $bindable(), dropdowns = $bindable() } = $props()
</script>

<section class="break-inside-avoid-column">
    <button class="font-medium text-base" onclick={() => dropdowns.hello = !dropdowns.hello}>Hellō Parameters</button>
    {#if dropdowns.hello}
        <div class="flex">
            <ul class="space-y-2">
                {#each PARAMS.HELLO_PARAM.PARAMS as pclParam}
                    {@const required = PARAMS.HELLO_PARAM.REQUIRED.includes(pclParam.NAME)}
                    <li class="flex flex-row items-center space-x-2">
                        <input
                            type="checkbox"
                            id={pclParam.NAME}
                            name="scope"
                            bind:group={selectedParams}
                            value={pclParam.NAME}
                        />
                        <label for={pclParam.NAME} class="text-sm font-normal">{pclParam.NAME} {required ? '*' : ''}</label>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</section>