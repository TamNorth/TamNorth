<script lang="ts">
	import { resolve } from '$app/paths';
	import { Icon } from 'svelte-icons-pack';
	import { BsEyeFill, BsEyeSlashFill, BsMoonFill, BsSunFill } from 'svelte-icons-pack/bs';

	const homeButtonText = '<span>tam </span><span style="font-size: xx-large">N</span><span>orth</span>';

	// HEADER OPACITY FADE
	let accessibilityMode = $state(false);

	// THEME SELECTION
	let isNightMode = $state(true);
	let themeClassNames = ["day-mode", "night-mode"]
	$effect(() => {
		document.body.classList.add(themeClassNames[Number(isNightMode)]); 
		document.body.classList.remove(themeClassNames[Number(!isNightMode)]);
	})

	// TOUCH HANDLING
	let firstTouchDetection = $state(true)
</script>

<svelte:window ontouchstart={() => {
	if (firstTouchDetection) accessibilityMode = true; firstTouchDetection = false}}/>

<!-- <svelte:body class:{themeClassNames[Number(!isNightMode)]}/> -->

<header class="header {accessibilityMode ? 'header-hidden' : ''}">
	<!-- NAVIGATION -->
	<nav class="navigation">
		<!-- <a href={resolve('/about')} class="header-button">About</a> -->
		<a href={resolve('/')} aria-label="go to homepage" class="header-button home-button">
			{@html homeButtonText}
		</a>
	</nav>
	<!-- CONTROLS -->
	 <div class="header-controls">
		<button
			class="header-button"
			onclick={() => (accessibilityMode = !accessibilityMode)}
			aria-label="toggle accessibility mode {accessibilityMode ? 'off' : 'on'}"
		>
			<Icon src={accessibilityMode ? BsEyeFill : BsEyeSlashFill} />
		</button>
		<button
			class="header-button"
			onclick={() => {isNightMode = !isNightMode}}
			aria-label="toggle theme"
		>
			<Icon src={isNightMode ? BsSunFill : BsMoonFill} />
		</button>
	</div>
</header>

<style>
	.header {
		--gap-spacing: 1rem;
		font-family: 'Cinzel Decorative';
		position: fixed;
		inset-inline: 0;
		top: 0;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		justify-items: center;
		gap: var(--gap-spacing);
		padding: 0 var(--gap-spacing) 0;
		color: var(--text-colour-h1);
	}

	.header-hidden {
		opacity: 20%;
		transition: opacity 0.5s;

		&:hover {
			opacity: 100%;
		}
	}

	.navigation {
		grid-column: 2;
		/* display: grid;
		grid-template-columns: 1fr auto 1fr; */
		align-items: center;
		/* gap: 2rem; */
		text-align: center;
	}

	.header-button {
		transition: scale 0.5s;
		cursor: pointer;

		&:hover {
			scale: 110%;
		}
	}

	.home-button {
		display: flex;
		align-items: center;
		font-size: x-large;
		white-space: pre;
	}

	.header-controls {
		justify-self: end;
		display: flex;
		gap: var(--gap-spacing);
	}
</style>
