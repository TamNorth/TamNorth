<script lang="ts">
	import { resolve } from '$app/paths';
	import { Icon } from 'svelte-icons-pack';
	import { BsEyeFill, BsEyeSlashFill } from 'svelte-icons-pack/bs';
	import StyleSelector from './StyleSelector.svelte';

	const homeButtonText =
		'<span>tam </span><span style="font-size: xx-large">N</span><span>orth</span>';

	// HEADER OPACITY FADE
	let accessibilityMode = $state(false);

	// TOUCH HANDLING
	let firstTouchDetection = $state(true);
</script>

<svelte:window
	ontouchstart={() => {
		if (firstTouchDetection) accessibilityMode = true;
		firstTouchDetection = false;
	}}
/>

<header class="header {accessibilityMode ? '' : 'header-hidden'}">
	<!-- NAVIGATION -->
	<nav class="navigation">
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
		<StyleSelector />
	</div>
</header>

<style>
	.header {
		--gap-spacing: var(--base-spacing);
		font-family: 'Cinzel Decorative';
		position: fixed;
		inset-inline: 0;
		top: 0;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		justify-items: center;
		gap: var(--gap-spacing);
		/* bottom-padding to increase header hover detection area */
		padding: 0 var(--gap-spacing) var(--gap-spacing);
		z-index: 1;
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
		align-items: center;
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
