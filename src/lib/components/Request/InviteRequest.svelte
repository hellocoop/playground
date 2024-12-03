<script>
    import { highlight } from '$lib/shiki.js'
    import { lineBreakUrl } from '$lib/utils.js'
    import CopyButton from '$components/CopyButton.svelte'

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
                class="overflow-x-auto bg-[#F2F6FB] dark:bg-charcoal rounded-sm p-4 break-words relative"
            >
                <span class="absolute right-4 top-4">
                    <CopyButton content={inviteUrl}/>
                </span>
                <h2 class="inline-flex items-center space-x-1 font-medium">
                    Invite URL
                </h2>
                <span
                    class="url-container mt-2 block text-sm"
                >
                    {@html highlight('http', lineBreakUrl(inviteUrl))}
                </span>
            </div>
        {/if}

        <button
            onclick={inviteWithHello}
            class="hello-btn-black-and-static w-full disabled:opacity-30 mt-3"
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
