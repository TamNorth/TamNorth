import { themes, themeRules } from '../constants/styles/themes/themes.js';
import fs from 'fs';

export default function generateCss() {
	const cssVars = Object.entries(themes)
		.map(([themeName, mode]) =>
			Object.entries(mode).map(([modeName, themeObjs]) => {
				const properties = Object.entries(themeObjs)
					.map(([category, themeObj]) =>
						Object.entries(themeObj).map(
							([propertyName, value]) =>
								`   --${category}-${propertyName.trim()}: ${value.trim()}; `
						)
					)
					.flat()
					.join('\n');
				return `:root[data-theme="${themeName}-${modeName}"] {\n${properties}\n}`;
			})
		)
		.flat()
		.join('\n\n');

	const cssRules = Object.entries(themeRules)
		.map(([themeName, rule]) => `:root[data-theme^="${themeName}"] {\n${rule}\n}`)
		.join('\n\n');

	const css = [cssVars, cssRules].join('\n\n');

	fs.writeFileSync('./src/app.css', css);
}
