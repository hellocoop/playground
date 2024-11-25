<script>
    import { PARAMS } from '../constants.js'
    let { selectedParams = $bindable(), selectedParamsValues = $bindable() } = $props()
</script>

<section>
    <legend class="font-medium text-base">Protocol Parameters</legend>
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
</section>