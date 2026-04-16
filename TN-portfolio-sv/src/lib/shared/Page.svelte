<script>
    let { children = undefined } = $props();
</script>

<div class="background">
    {#if !!children}
        <div class="grid">
            {@render children()}
        </div>
    {/if}
</div>

<style>
    .background :global {
        position: fixed;
		background-color: var(--background-colour-base);
        height: 100vh;
        width: 100vw;
    }

    .grid {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        grid-template-rows: var(--header-height) auto;
        gap: var(--base-spacing);
    }
</style>