<script lang="ts">
	import Header from '$lib/Header/Header.svelte';
	import './layout.css';

	const { children } = $props();
	export const prerender = true;
</script>

<Header />

{@render children()}
