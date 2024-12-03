<script>
	import { slide } from "svelte/transition";
	import ExternalLinkIcon from "./Icons/ExternalLinkIcon.svelte";
    import MenuIcon from "./Icons/MenuIcon.svelte";
    import CloseIcon from "./Icons/CloseIcon.svelte";

	const navLinks = [
		{
			text: "Documentation",
			link: "https://hello.dev/documentation/",
		},
		{
			text: "Console",
			link: "https://console.hello.coop/",
		},
	];

	let mobileMenu = $state(false);
</script>

<header
	class="text-white dark:text-gray flex-shrink-0 bg-charcoal h-12 flex items-center justify-between px-4 font-medium text-lg"
>
	<div class="w-1/3 inline-flex items-center">
		<button
			onclick={() => (mobileMenu = !mobileMenu)}
			class="lg:hidden mr-2 group"
		>
			{#if mobileMenu}
				<CloseIcon/>
			{:else}
				<MenuIcon/>
			{/if}
		</button>
		<a
			href="https://hello.dev"
			target="_blank"
			class="hidden sm:inline-flex items-center relative nav-link font-normal hover:underline"
		>
			<span>hello.dev</span>
			<ExternalLinkIcon />
		</a>
	</div>
	<span class="md:w-1/3 flex justify-center flex-shrink-0">
		<img src="logo.svg" alt="Hellō Playground" />
	</span>
	<div class="w-1/3 flex justify-end space-x-4">
		<ul class="hidden lg:flex space-x-4">
			{#each navLinks as { text, link }}
				<li class="nav-link text-sm font-normal relative">
					<a
						href={link}
						target="_blank"
						class="inline-flex items-center hover:underline"
					>
						{text}
						<ExternalLinkIcon />
					</a>
				</li>
			{/each}
		</ul>
	</div>

	{#if mobileMenu}
		<div
			class="bg-charcoal lg:hidden absolute left-0 top-12 w-full px-4 z-50 min-w-[320px]"
			transition:slide={{duration:150}}
		>
			<ul class="flex flex-col gap-y-3 pb-4 text-base">
				<li class="nav-link relative sm:hidden">
					<a
						href="https://hello.dev"
						target="_blank"
						class="inline-flex items-center font-medium hover:underline"
					>
						hello.dev
						<ExternalLinkIcon />
					</a>
				</li>
				{#each navLinks as { text, link }}
					<li class="nav-link relative">
						<a
							href={link}
							target="_blank"
							class="inline-flex items-center font-medium hover:underline"
						>
							{text}
							<ExternalLinkIcon />
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<div
			role="button"
			aria-label="Close mobile menu"
			tabindex="0"
			onclick={() => (mobileMenu = false)}
			onkeydown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					mobileMenu = false;
				}
			}}
			class="lg:hidden fixed top-12 left-0 z-40 bg-black bg-opacity-60 w-full h-full"
		></div>
	{/if}
</header>
