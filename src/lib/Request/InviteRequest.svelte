<script>
    let { inviteUrl, canInvite = false } = $props();

    let inviteWithHelloAjax = $state(false);
    async function inviteWithHello() {
        inviteWithHelloAjax = true;
        window.location.href = inviteUrl;
    }
</script>

<section
    class="relative border border-charcoal dark:border-gray-800 rounded-sm w-full px-4 pb-4 pt-6"
>
    <span
        class="absolute -mt-9 bg-white dark:bg-[#151515] px-2 -mx-2 text-white/50"
        >Invite Request</span
    >
    <div class="max-w-lg mx-auto">
        {#if canInvite}
            <div
                class="overflow-x-auto bg-[#F2F6FB] dark:bg-charcoal rounded-sm p-4 break-words mb-4"
            >
                <h2 class="inline-flex items-center">
                    <span class="font-medium">Invite URL</span>
                    <!-- <button on:click={() => copy('invitePlaygroundURL', invitePlaygroundURL)}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 ml-1 stroke-2 hover:stroke-3"
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
                </h2>
                <span
                    class="url-container mt-2 block text-sm whitespace-pre-line"
                >
                    {@html inviteUrl}
                </span>
                <!-- <span
                    class="url-container mt-2 block text-sm whitespace-pre-line"
                    class:flash={copyTooltip.invitePlaygroundURL}
                >
                    {@html highlight("http", invitePlaygroundURL)}
                </span> -->
            </div>
        {/if}

        <button
            onclick={inviteWithHello}
            class="hello-btn-black-and-static w-full disabled:opacity-30"
            class:hello-btn-loader={inviteWithHelloAjax}
            disabled={inviteWithHelloAjax || !canInvite}
            >Invite others to Playground</button
        >
        <p class="text-sm text-center mt-2 opacity-70">
            {#if canInvite}
                Use this to test sending invitations
            {:else}
                To invite others, your must provide the<br />`name` and `email`
                claims
            {/if}
        </p>
    </div>
</section>
