<script>
    import { PARAMS } from "../constants.js";
    import ChevronY from "./ChevronY.svelte";
    import Tooltip from "./Tooltip.svelte";

    let {
        selectedParams = $bindable(),
        selectedParamsValues = $bindable(),
        dropdowns = $bindable(),
    } = $props();
</script>

<section class="break-inside-avoid-column">
    <button
        class="inline-flex items-center space-x-2"
        onclick={() => (dropdowns.protocol = !dropdowns.protocol)}
    >
        <span class="font-medium text-base"> Protocol Parameters </span>
        <ChevronY dir={dropdowns.protocol ? "up" : "down"} />
        <Tooltip
            content="Protocol Parameters Docs",
            href="https://www.hello.dev/docs/oidc/request/#openid-connect-parameters"
        />
    </button>
    {#if dropdowns.protocol}
        <ul class="flex flex-col mt-2 space-y-2">
            {#each PARAMS.PROTOCOL_PARAM.PARAMS as pclParam}
                {@const required = PARAMS.PROTOCOL_PARAM.REQUIRED.includes(
                    pclParam.NAME,
                )}
                {@const selected = selectedParams.includes(pclParam.NAME)}
                {@const hasValue = !!selectedParamsValues[pclParam.NAME]}
                <li class="flex flex-row items-center space-x-2">
                    <input
                        type="checkbox"
                        id={pclParam.NAME}
                        name="scope"
                        bind:group={selectedParams}
                        value={pclParam.NAME}
                    />
                    <label for={pclParam.NAME} class="font-normal w-48"
                        class:text-red-500={(!selected || !hasValue) && required}
                        >{pclParam.NAME} {required ? "*" : ""}</label
                    >

                    {#if Array.isArray(pclParam.POSSIBLE_VALUE)}
                        <ul class="xl:h-8 p-1 space-y-0.5 xl:space-y-0 xl:space-x-1 w-full ring-1 ring-charcoal dark:ring-gray-800 flex flex-col xl:flex-row items-center rounded-sm"
                            class:opacity-50={!selected}
                        >
                            {#each pclParam.POSSIBLE_VALUE as value}
                                <li class="w-full">
                                    <input name={pclParam.NAME} id={value} value={value} bind:group={selectedParamsValues[pclParam.NAME]} type="radio" class="hidden peer">
                                    <label for={value} class="peer-checked:bg-charcoal peer-checked:ring-1 ring-charcoal dark:ring-gray-800 block flex justify-center items-center w-full cursor-pointer">
                                        {value}
                                    </label>
                                </li>
                            {/each}
                        </ul>
                    {:else}
                        <input
                            type="text"
                            class="border w-full form-input h-6 px-2"
                            bind:value={selectedParamsValues[pclParam.NAME]}
                            placeholder={pclParam.PLACEHOLDER}
                        />
                    {/if}
                </li>
            {/each}
        </ul>
    {/if}
</section>
