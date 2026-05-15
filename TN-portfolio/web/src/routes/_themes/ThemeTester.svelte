<script>
	import Light from '$lib/shared/Light.svelte';
	import Tile from '$lib/shared/Tile.svelte';
</script>

<Tile>
	<Light colour="error" size={2} />
	<Light colour="alert" size={2} />
	<Light colour="warn" size={2} />
	<Light colour="positive" size={2} />
	<Light colour="info" size={2} />
</Tile>
