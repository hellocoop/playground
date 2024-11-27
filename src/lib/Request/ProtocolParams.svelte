<script>
    import { slide } from 'svelte/transition';
    import { PARAMS } from "../../constants.js";
    import ChevronY from "../ChevronY.svelte";
    import Tooltip from "../Tooltip.svelte";

    let {
        selectedPtlParams = $bindable(),
        selectedPtlParamsValues = $bindable(),
        dropdowns = $bindable(),
        isHelloMode
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
        <ul class="flex flex-col mt-2 space-y-2" transition:slide={{duration: 150}}>
            {#each PARAMS.PROTOCOL_PARAM.PARAMS as pclParam}
                {@const required = PARAMS.PROTOCOL_PARAM.REQUIRED.includes(
                    pclParam.NAME,
                )}
                {@const selected = selectedPtlParams.includes(pclParam.NAME)}
                {@const hasValue = !!selectedPtlParamsValues[pclParam.NAME]}
                <li class="flex flex-row items-center space-x-2">
                    <input
                        type="checkbox"
                        id={pclParam.NAME}
                        name="param"
                        bind:group={selectedPtlParams}
                        class:invisible={pclParam.CHECKBOX_HIDDEN}
                        value={pclParam.NAME}
                    />
                    <label for={pclParam.NAME} class="font-normal w-48" class:pointer-events-none={pclParam.CHECKBOX_HIDDEN}
                        class:text-red-500={(!selected || !hasValue) && required}
                        >{pclParam.NAME} {required ? "*" : ""}</label
                    >

                    {#if Array.isArray(pclParam.POSSIBLE_VALUE)}
                        <ul class="xl:h-8 p-1 space-y-0.5 xl:space-y-0 xl:space-x-1 w-full ring-1 ring-charcoal dark:ring-gray-800 flex flex-col xl:flex-row items-center rounded-sm"
                            class:opacity-50={!selected}
                        >
                            {#each pclParam.POSSIBLE_VALUE as value}
                                <li class="w-full">
                                    {#if pclParam.ONLY_ONE}
                                        <input type="radio" name={pclParam.NAME} id={value} value={value} bind:group={selectedPtlParamsValues[pclParam.NAME]} class="hidden peer">
                                    {:else}
                                        <input type="checkbox" name={pclParam.NAME} id={value} value={value} bind:group={selectedPtlParamsValues[pclParam.NAME]} class="hidden peer">
                                    {/if}
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
                            class:opacity-50={!selected}
                            bind:value={selectedPtlParamsValues[pclParam.NAME]}
                            placeholder={pclParam.PLACEHOLDER}
                        />
                    {/if}
                </li>
            {/each}
        </ul>
    {/if}
</section>
