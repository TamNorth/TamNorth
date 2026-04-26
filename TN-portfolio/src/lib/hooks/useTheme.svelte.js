import { themes } from '../constants/styles/themes/themes.js';

export default function useTheme(themeName = null, isDarkMode = true) {
    const themeNames = Object.keys(themes);
    let currentThemeName = themeName ?? themeNames[0];
    const currentTheme = $derived(themes[currentThemeName]?.[isDarkMode ? 'dark' : 'light']);

    return {themeNames, currentTheme}
}