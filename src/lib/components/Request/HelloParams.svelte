<script>
    import { slide } from "svelte/transition";
    import { PARAMS } from "$lib/constants.js";
    import ChevronY from "$components/ChevronY.svelte";
    import Tooltip from "$components/Tooltip.svelte";
    import ProviderHintInput from "$components/Inputs/ProviderHintInput.svelte";
    import DomainHintInput from "$components/Inputs/DomainHintInput.svelte";

    let {
        selectedHelloParams = $bindable(),
        selectedHelloParamsValues = $bindable(),
        dropdowns = $bindable(),
        isHelloMode,
    } = $props();
</script>

<section class="break-inside-avoid-column">
    <button
        class="inline-flex items-center space-x-2"
        onclick={() => (dropdowns.hello = !dropdowns.hello)}
    >
        <span class="font-medium text-base"> Hellō Parameters </span>
        <ChevronY dir={dropdowns.hello ? "up" : "down"} />
        <Tooltip
            content="Hellō Parameters Docs"
            ,
            href="https://www.hello.dev/docs/oidc/request/#hellō-parameters"
        />
    </button>
    {#if dropdowns.hello}
        {@const ALL_HELLO_PARAMS = [
            ...PARAMS.HELLO_PARAM.PARAMS,
            ...(isHelloMode ? PARAMS.HELLO_PARAM.HELLO_EXTEND_PARAMS : [])
        ]}
        <ul
            class="flex flex-col justify-center mt-2 space-y-2"
            transition:slide={{ duration: 150 }}
        >
            {#each ALL_HELLO_PARAMS as param}
                {@const required = PARAMS.HELLO_PARAM.REQUIRED.includes(
                    param.NAME,
                )}
                {@const selected = selectedHelloParams.includes(param.NAME)}
                <li class="flex flex-row items-start">
                    <div class="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id={param.NAME}
                            name="param"
                            bind:group={selectedHelloParams}
                            value={param.NAME}
                        />
                        <label for={param.NAME} class="font-normal w-48"
                            >{param.NAME} {required ? "*" : ""}</label
                        >
                    </div>
                    <div class="flex flex-col w-full">
                        {#if param.NAME === "provider_hint"}
                            <ProviderHintInput
                                {selected}
                                bind:value={selectedHelloParamsValues.provider_hint}
                                {isHelloMode}
                            />
                        {:else if param.NAME === "domain_hint"}
                            <DomainHintInput
                                {selected}
                                bind:value={selectedHelloParamsValues.domain_hint}
                                {isHelloMode}
                            />
                        {:else}
                            <input
                                type="text"
                                class="border w-full form-input h-6 px-2"
                                class:opacity-50={!selected}
                                bind:value={selectedHelloParamsValues[
                                    param.NAME
                                ]}
                            />
                        {/if}
                        {#if param.HINT}
                            <p class="text-xs opacity-70 mt-1">
                                {param.HINT}
                            </p>
                        {/if}
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</section>
