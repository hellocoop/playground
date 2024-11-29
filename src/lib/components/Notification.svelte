<script>
    import { slide } from 'svelte/transition'

    let { errorNotification } = $props()
</script>

<div class="bg-red-500 p-2.5 text-center text-white flex items-center justify-center" out:slide>
    <span class="text-sm">{errorNotification}</span>
    <button class="absolute right-4" onclick={() => (errorNotification = null)} aria-label="close">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5"
        >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
</div>