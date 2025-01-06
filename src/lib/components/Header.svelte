<script>
	import { slide } from 'svelte/transition';
	import ExternalLinkIcon from './Icons/ExternalLinkIcon.svelte';
	import MenuIcon from './Icons/MenuIcon.svelte';
	import CloseIcon from './Icons/CloseIcon.svelte';

	const navLinks = [
		{
			text: 'Documentation',
			link: 'https://hello.dev/docs/'
		},
		{
			text: 'Console',
			link: 'https://console.hello.coop/'
		}
	];

	let mobileMenu = $state(false);
</script>

<header
	class="flex h-12 flex-shrink-0 items-center justify-between bg-charcoal px-4 text-lg font-medium text-white dark:text-gray"
>
	<div class="inline-flex w-1/3 items-center">
		<button onclick={() => (mobileMenu = !mobileMenu)} class="group mr-2 md:hidden">
			{#if mobileMenu}
				<CloseIcon />
			{:else}
				<MenuIcon />
			{/if}
		</button>
		<a
			href="https://hello.dev"
			target="_blank"
			class="nav-link relative hidden items-center font-normal hover:underline md:inline-flex"
		>
			<span>hello.dev</span>
			<ExternalLinkIcon />
		</a>
	</div>
	<span class="flex flex-shrink-0 justify-center md:w-1/3">
		<img src="logo.svg" alt="Hellō Playground" />
	</span>
	<div class="flex w-1/3 justify-end space-x-4">
		<ul class="hidden space-x-4 md:flex">
			{#each navLinks as { text, link }}
				<li class="nav-link relative text-sm font-normal">
					<a href={link} target="_blank" class="inline-flex items-center hover:underline">
						{text}
						<ExternalLinkIcon />
					</a>
				</li>
			{/each}
		</ul>
	</div>

	{#if mobileMenu}
		<div
			class="absolute left-0 top-12 z-50 w-full min-w-[320px] bg-charcoal px-4 md:hidden"
			transition:slide={{ duration: 150 }}
		>
			<ul class="flex flex-col gap-y-3 pb-4 text-base">
				<li class="nav-link relative">
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
				if (e.key === 'Enter' || e.key === ' ') {
					mobileMenu = false;
				}
			}}
			class="fixed left-0 top-12 z-40 h-full w-full bg-black bg-opacity-60 md:hidden"
		></div>
	{/if}
</header>
