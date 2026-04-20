<script>
	import Tile from '$lib/shared/Tile.svelte';
	import Card from '$lib/shared/Card.svelte';
	import Light from '$lib/shared/Light.svelte';
	import Link from '$lib/shared/Link.svelte';
	import Page from '$lib/shared/Page.svelte';
</script>

<Page>
	<Card visible={false}>
		<Tile><Light colour="red" size={1}></Light></Tile>
	</Card>
</Page>
