<script>
    let { isHelloMode = $bindable() } = $props()
</script>

<div class="flex items-center absolute absolute -top-3.5 right-20">
    <div>
        <input
            id="mode-hello"
            value={true}
            type="radio"
            class="peer hidden"
            bind:group={isHelloMode}
        />
        <label
            for="mode-hello"
            class="rounded-l-md"
            ><span class="hidden xs:inline">Hell</span>ō</label
        >
    </div>
    <div>
        <input
            id="mode-public"
            value={false}
            type="radio"
            class="peer hidden"
            bind:group={isHelloMode}
        />
        <label
            for="mode-public"
            class="rounded-r-md"
            >P<span class="hidden xs:inline">ublic</span></label
        >
    </div>
</div>

<style>
    label {
        @apply cursor-pointer select-none px-3 py-0.5 border-l border-y border-charcoal dark:border-gray-800 text-xs bg-white dark:bg-[#151515] peer-checked:bg-charcoal peer-checked:text-white;
    }
</style>