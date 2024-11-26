<script>
    import { slide } from "svelte/transition";
    import { AUTHZ_SERVERS } from "../../constants.js";
    import ChevronY from "../ChevronY.svelte";

let { dropdowns = $bindable(), selectedAuthzServer = $bindable(), isHelloMode } = $props();
</script>

<section>
    <button
        class="inline-flex items-center space-x-2"
        onclick={() => (dropdowns.server = !dropdowns.server)}
    >
        <span class="font-medium text-base"> Authorization Server </span>
        <ChevronY dir={dropdowns.server ? "up" : "down"} />
    </button>
    {#if dropdowns.server}
        <ul class="space-y-2 mt-2" transition:slide|local>
            {#each [...AUTHZ_SERVERS.SERVERS, ...(isHelloMode ? AUTHZ_SERVERS.HELLO_EXTEND_SERVERS : [])] as server}
                <li class="flex items-center">
                    <input
                        type="radio"
                        name="authorization_server"
                        value={server}
                        id={server}
                        class="text-charcoal dark:text-gray-800"
                        bind:group={selectedAuthzServer}
                    />
                    <label for={server} class="ml-2 w-full break-all"
                        >{server}</label
                    >
                </li>
            {/each}
            <!-- <li class="flex items-center">
                <input
                    type="radio"
                    name="authorization_server"
                    value={custom_authorization_server}
                    class="text-charcoal form-radio dark:text-gray-800"
                    id="custom-authorization-server"
                    bind:group={states.selected_authorization_server}
                />
                <input
                    bind:value={custom_authorization_server}
                    oninput={(e) =>
                        (states.selected_authorization_server = e.target.value)}
                    type="url"
                    name="custom"
                    class="h-8 ml-2 w-full text-charcoal form-input"
                    placeholder="eg http://example.com:9000/"
                />
            </li> -->
        </ul>
    {/if}
</section>
