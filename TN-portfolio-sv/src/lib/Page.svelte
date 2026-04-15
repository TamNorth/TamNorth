<script>
    let { children } = $props();
</script>

<div class="background">
    {@render children()}
</div>

<style>
    .background :global {
		background-color: var(--background-colour-base);
        height: 100vh;

        h1 {
            color: var(--text-colour-h1);
        }
    }
</style>