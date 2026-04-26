<script>
	import useTheme from '$lib/hooks/useTheme.svelte.js';
	import { Icon } from 'svelte-icons-pack';
	import { BsMoonFill, BsSunFill } from 'svelte-icons-pack/bs';

	const { themeNames } = useTheme();

	let activeTheme = $state({});
	let isDarkMode = $state(true);

	$effect(() => {
		const { currentTheme } = useTheme(themeNames[0], isDarkMode);
		activeTheme = currentTheme;
	});

	$effect(() =>
		Object.values(activeTheme).forEach((themeObj) => {
			Object.entries(themeObj).forEach(([propertyName, value]) =>
				document.documentElement.style.setProperty(`--${propertyName}`, value)
			);
		})
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
