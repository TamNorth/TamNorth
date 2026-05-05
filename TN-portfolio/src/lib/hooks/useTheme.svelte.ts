import { themes } from '../constants/styles/themes/themes.js';

export default function useTheme(themeName: string | null = null, isDarkMode: boolean = true) {
	const themeNames = Object.keys(themes);
	const currentThemeName = themeName ?? themeNames[0];
	const currentTheme = $derived(themes[currentThemeName]?.[isDarkMode ? 'dark' : 'light']);

	return { themeNames, currentTheme };
}
