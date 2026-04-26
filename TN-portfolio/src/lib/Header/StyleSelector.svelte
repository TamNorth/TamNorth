<script>
	import { themes } from '../constants/styles/themes/themes.js';
	import { Icon } from 'svelte-icons-pack';
	import { BsMoonFill, BsSunFill } from 'svelte-icons-pack/bs';

	const themeNames = Object.keys(themes);
	let currentThemeName = $state(themeNames[0]);
	let isDarkMode = $state(true);
	const currentTheme = $derived(themes[currentThemeName]?.[isDarkMode ? 'dark' : 'light']);

	$effect(() =>
		Object.entries(currentTheme).forEach(([propertyName, value]) =>
			document.documentElement.style.setProperty(propertyName, value)
		)
	);
</script>

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
		color: var(--colour-t-0, #000);
		background-color: var(--colour-b-0, #fff);

		h1 {
			color: var(--colour-t-1, #000);
		}
	}
</style>
