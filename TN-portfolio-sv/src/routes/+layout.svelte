<script lang="ts">
	import Header from '$lib/Header/Header.svelte';
	import './layout.css';

	const { children } = $props();
</script>

<Header />

{@render children()}
