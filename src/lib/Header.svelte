<script>
	const navLinks = [
		{
			text: 'Documentation',
			link: 'https://hello.dev/documentation/'
		},
		{
			text: 'Console',
			link: 'https://console.hello.coop/'
		}
	];

	let mobileMenu = $state(false)
</script>

<header
	class="text-white dark:text-gray flex-shrink-0 bg-charcoal h-12 flex items-center justify-between px-4 font-medium text-lg"
>
	<div class="w-1/3 inline-flex items-center">
		<!-- <button on:click={() => (mobileMenu = !mobileMenu)} class="lg:hidden mr-2 group">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					class="stroke-2 group-hover:stroke-3"
					d="M4 6h16M4 12h16M4 18h16"
				/>
			</svg>
		</button> -->
		<a
			href="https://hello.dev"
			target="_blank"
			class="hidden sm:inline-flex items-center relative nav-link"
		>
			<span>hello.dev</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 ml-1 mt-0.5 opacity-80 flex-shrink-0"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
				/>
			</svg>
		</a>
	</div>
	<span class="md:w-1/3 flex justify-center flex-shrink-0">
		<img src="logo.svg" alt="Hellō Playground" />
	</span>
	<div class="w-1/3 flex justify-end space-x-4">
		<ul class="hidden lg:flex space-x-4">
			{#each navLinks as { text, link }}
				<li class="nav-link text-sm font-normal relative">
					<a href={link} target="_blank" class="inline-flex items-center">
						{text}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-3 ml-1 mt-0.5 opacity-80"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
							/>
						</svg>
					</a>
				</li>
			{/each}
		</ul>
	</div>

	{#if mobileMenu}
		<div class="bg-charcoal lg:hidden absolute left-0 top-12 w-full px-4 z-50 min-w-[320px]">
			<ul class="flex flex-col gap-y-3 pb-4 text-base">
				<li class="nav-link relative sm:hidden">
					<a href="https://hello.dev" target="_blank" class="inline-flex items-center font-medium">
						hello.dev
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 ml-1 mt-0.5 opacity-80"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
							/>
						</svg>
					</a>
				</li>
				{#each navLinks as { text, link }}
					<li class="nav-link relative">
						<a href={link} target="_blank" class="inline-flex items-center font-medium">
							{text}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 ml-1 mt-0.5 opacity-80"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
								/>
							</svg>
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<div
			onclick={() => (mobileMenu = false)}
			class="lg:hidden fixed top-12 left-0 z-40 bg-black bg-opacity-60 w-full h-full"
		></div>
	{/if}
</header>

<style>
	.nav-link:hover::after {
		width: 100%;
		content: ' ';
		height: 2px;
		background-color: white;
		display: inline-block;
		position: absolute;
		bottom: -4px;
		left: 0;
	}
</style>