import { themes } from '../constants/styles/themes/themes.js';
import fs from 'fs';

export default function generateCss() {
	const css = Object.entries(themes)
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

	fs.writeFileSync('./src/app.css', css);
}
