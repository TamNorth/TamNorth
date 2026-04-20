<script>
	import Tile from '$lib/shared/Tile.svelte';
	import Card from '$lib/shared/Card.svelte';
	import Light from '$lib/shared/Light.svelte';
	import Link from '$lib/shared/Link.svelte';
	import Page from '$lib/shared/Page.svelte';
	import ThemeTester from './ThemeTester.svelte';
</script>

<Page>
	<Card visible={false}>
		<div class="night-mode">
			<ThemeTester />
		</div>
		<div class="day-mode">
			<ThemeTester />
		</div>
	</Card>
</Page>
