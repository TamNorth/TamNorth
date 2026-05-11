<script>
	import { Icon } from 'svelte-icons-pack';
	import { BsMoonFill, BsSunFill } from 'svelte-icons-pack/bs';
	import { themes } from '../constants/styles/themes/themes.ts';
	import theme from '../hooks/useTheme.svelte.ts';
	let isDarkMode = $state(true);
	const themeNames = Object.keys(themes);

	$effect(() => {
		theme.darkMode = isDarkMode;
		document.documentElement.setAttribute('data-theme', theme.name);
	});

	function handleThemeChange(themeName) {
		theme.style = themeName;
		document.documentElement.setAttribute('data-theme', theme.name);
	}
</script>

{#each themeNames as themeName (themeName)}
	<button
		class="header-button"
		onclick={() => handleThemeChange(themeName)}
		// aria-label="toggle theme"
	>
		<!-- <Icon src={isDarkMode ? BsSunFill : BsMoonFill} /> -->
		{themeName}
	</button>
{/each}

<button
	class="header-button"
	onclick={() => {
		isDarkMode = !isDarkMode;
	}}
	aria-label="toggle theme"
>
	<Icon src={isDarkMode ? BsSunFill : BsMoonFill} />
</button>

<style>
	:global(:root) {
		color: var(--colours-t0, #000);
		background-color: var(--colours-b0, #fff);

		h1 {
			color: var(--colours-t1, #000);
		}
	}
</style>
