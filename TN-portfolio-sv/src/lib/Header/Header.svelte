<script lang="ts">
	import { resolve } from '$app/paths';
	import { Icon } from 'svelte-icons-pack';
	import { BsEyeFill, BsEyeSlashFill, BsMoonFill, BsSunFill } from 'svelte-icons-pack/bs';

	const homeButtonText = '<span>tam </span><span style="font-size: xx-large">N</span><span>orth</span>';

	let visibility = $state(false);
	let headerClass = $derived(visibility ? '' : 'header-hidden');
	let theme = $state("day");
</script>

<header class="header {headerClass} {theme}-mode">
	<nav class="navigation">
		<a href={resolve('/about')} class="button">About</a>
		<a href={resolve('/')} aria-label="Tam North homepage" class="button home-button">
			{@html homeButtonText}
		</a>
		<a href={resolve('/about')}>About</a>
	</nav>
	<button
		class="button"
		onclick={() => (visibility = !visibility)}
		aria-label="toggle header visibility aid {visibility ? 'off' : 'on'}"
	>
		{#if visibility}
			<Icon src={BsEyeFill} />
		{:else}
			<Icon src={BsEyeSlashFill} />
		{/if}
	</button>
	<button
		class="button"
		onclick={() => (theme = (theme === "day") ? "night" : "day")}
		aria-label="toggle theme: {theme}"
	>
		{#if theme === "day"}
			<Icon src={BsMoonFill} />
		{:else}
			<Icon src={BsSunFill} />
		{/if}
	</button>
</header>

<style>
	.header {
		/* background-color: var(--tam-bg-1); */
		font-family: 'Cinzel Decorative';
		position: fixed;
		inset-inline: 0;
		top: 0;
		display: grid;
		grid-template-columns: 1fr 1fr auto 1fr 1fr;
		align-items: center;
		justify-items: center;
		gap: 2rem;
		padding-bottom: 1rem;
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
		grid-column: 3;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 2rem;
		text-align: center;
	}

	.button {
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
</style>
