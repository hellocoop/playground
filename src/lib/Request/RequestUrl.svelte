<script>
    import { highlight } from '../shiki.js'
    import { lineBreakUrl } from '../utils.js'
    import { slide } from 'svelte/transition'

    let { dropdowns = $bindable(), authzUrl } = $props()

    let continueWithHelloAjax = $state(false);
	async function continueWithHello() {
		continueWithHelloAjax = true
        window.location.href = authzUrl
	}
</script>

<div class="break-inside-avoid-column">
    <div class="flex items-center">
        <button
            class="inline-flex items-center space-x-2"
            onclick={() => (dropdowns.request = !dropdowns.request)}
        >
            <h1 class="font-semibold text-lg">Request URL</h1>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="3"
                stroke="currentColor"
                class="w-4 h-4"
                class:rotate-180={dropdowns.request}
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
            </svg>
        </button>
    </div>
    {#if dropdowns.request}
        <div class="relative" transition:slide={{duration: 150}}>
            <!-- <button
                on:click={() => copy('requestURL', requestURL)}
                class="absolute z-50 right-2.5 top-2.5 w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-charcoal border border-[#808080] shadow-xl"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 stroke hover:stroke-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                </svg>
            </button> -->
            <div
                class="bg-[#F2F6FB] dark:bg-charcoal rounded-sm p-4 break-words mt-2 relative overflow-x-auto"
            >
                <span
                    class="url-container block text-sm whitespace-pre-line"
                >
                    {@html highlight('http', lineBreakUrl(authzUrl))}
                </span>
            </div>
        </div>
    {/if}

    <!-- class:hello-btn-hover-flare={darkMode} -->
    <button
        onclick={continueWithHello}
        class="hello-btn-black-and-static w-full flex mt-4"
        class:hello-btn-loader={continueWithHelloAjax}
        disabled={continueWithHelloAjax}
        >ō&nbsp;&nbsp;&nbsp;Continue with Hellō</button
    >
</div>