<script>
	import PanelMain from '$lib/shared/PanelMain.svelte';
	import Page from '$lib/shared/Page.svelte';
	import ThemeTester from './ThemeTester.svelte';
</script>

<Page>
	<PanelMain visible={false}>
		<div class="theme-cockpit">
			<div class="night-mode">
				<ThemeTester />
			</div>
			<div class="day-mode">
				<ThemeTester />
			</div>
		</div>
		<div class="theme-pixel">
			<div class="night-mode">
				<ThemeTester />
			</div>
			<div class="day-mode">
				<ThemeTester />
			</div>
		</div>
	</PanelMain>
</Page>
