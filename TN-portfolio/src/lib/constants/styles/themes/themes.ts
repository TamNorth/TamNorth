import { BASE_PROPERTIES } from './base.ts';
import * as cockpit from './cockpit.js';
import * as retro from './retro.js';

function formatCss(mode) {
	if (!!mode)
		return Object.entries(mode).reduce(
			(acc, [name, value]) => ({ ...acc, [name]: value.split('\n').join('') }),
			{}
		);
}

export const baseProperties = BASE_PROPERTIES;

export const themes: Record<
	string,
	{ light: Record<string, string>; dark: Record<string, string> }
> = Object.entries({
	cockpit,
	retro
}).reduce((acc, [themeName, themeObj]) => {
	const themeStyles = Object.entries(themeObj).reduce(
		(acc, [key, { dark, light, shared }]) => {
			const sharedVariables = formatCss(shared);
			return {
				dark: { ...acc.dark, [key]: { ...sharedVariables, ...formatCss(dark) } },
				light: { ...acc.light, [key]: { ...sharedVariables, ...formatCss(light) } }
			};
		},
		{ dark: {}, light: {} }
	);

	return { ...acc, [themeName]: themeStyles };
}, {});
