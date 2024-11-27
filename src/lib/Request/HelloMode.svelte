<script>
    let { isHelloMode = $bindable() } = $props()
</script>

<div class="flex items-center absolute absolute -top-3.5 right-18">
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
            class="cursor-pointer select-none rounded-l-full px-3 py-0.5 rounded-xl border-l border-y border-charcoal dark:border-gray-800 text-sm bg-white dark:bg-[#151515] peer-checked:bg-charcoal peer-checked:text-white"
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
            class="cursor-pointer select-none rounded-r-full px-3 py-0.5 rounded-xl border border-charcoal dark:border-gray-800 text-sm bg-white dark:bg-[#151515] peer-checked:bg-charcoal peer-checked:text-white"
            >P<span class="hidden xs:inline">ublic</span></label
        >
    </div>
</div>