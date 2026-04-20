<script>
	import { resolve } from '$app/paths';
	let { children = () => {}, href = '/' } = $props();

	// let style = $state('');

	// function handleMouseDown() {
	// 	style = 'background-color: red;';
	// }
</script>

<a class="link" href={resolve(href)}>
	{@render children()}
</a>

<style>
	a {
		padding: var(--base-spacing);
		background-color: var(--background-colour-button);
		cursor: pointer;

		&:active {
			background-color: red;
		}
	}
</style>
