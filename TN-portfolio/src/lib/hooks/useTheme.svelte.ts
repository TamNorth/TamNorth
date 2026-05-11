import { themes } from '../constants/styles/themes/themes.ts';

let themeName = $state('retro-dark');
const [style, mode] = $derived(themeName.split('-'));
const currentTheme = $derived(themes[style][mode]);

export default {
	get name() {
		return themeName;
	},
	set name(newThemeName) {
		themeName = newThemeName;
	},
	set darkMode(isDarkMode: boolean) {
		themeName = [style, isDarkMode ? 'dark' : 'light'].join('-');
	},
	set style(newStyle: string) {
		themeName = [newStyle, mode].join('-');
	},
	get variables() {
		return currentTheme;
	}
};
