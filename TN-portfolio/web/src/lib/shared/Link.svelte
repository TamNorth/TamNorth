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
		/* --shadow-spacing: 3px;
		--shadow-colour-test: rgb(170, 40, 40);
		--shadow-colour: 240, 46, 170; */
		padding: var(--base-spacing);
		background-color: var(--background-colour-button);
		cursor: pointer;
		/* transition: box-shadow 0.5s;

		&:hover {
			box-shadow:
				rgba(var(--shadow-colour), 0.4) 0px calc(var(--shadow-spacing) * 1) 0
					calc(var(--shadow-spacing) * 1.5),
				rgba(var(--shadow-colour), 0.3) 0px calc(var(--shadow-spacing) * 2) 0
					calc(var(--shadow-spacing) * 2.5),
				rgba(var(--shadow-colour), 0.2) 0px calc(var(--shadow-spacing) * 3) 0
					calc(var(--shadow-spacing) * 3.5),
				rgba(var(--shadow-colour), 0.1) 0px calc(var(--shadow-spacing) * 4) 0
					calc(var(--shadow-spacing) * 4.5),
				rgba(var(--shadow-colour), 0.05) 0px calc(var(--shadow-spacing) * 5) 0
					calc(var(--shadow-spacing) * 5.5);
		} */

		&:active {
			/* background-color: red; */
		}
	}
</style>
