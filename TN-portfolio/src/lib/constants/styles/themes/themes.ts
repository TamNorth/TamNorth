import base from './base.ts';
import * as cockpit from './cockpit.js';
import * as retro from './retro.js';

function formatCss(mode) {
	if (!!mode)
		return Object.entries(mode).reduce(
			(acc, [name, value]) => ({ ...acc, [name]: value.split('\n').join('') }),
			{}
		);
}

const { variables, rules } = Object.entries({ cockpit, retro }).reduce(
	(acc, [themeName, { variables, rules }]) => ({
		variables: variables ? { ...acc.variables, [themeName]: variables } : acc.variables,
		rules: rules ? { ...acc.rules, [themeName]: rules } : acc.rules
	}),
	{ variables: {}, rules: {} }
);

export const themes: Record<
	string,
	{ light: Record<string, string>; dark: Record<string, string> }
> = Object.entries(variables).reduce((acc, [themeName, themeObj]) => {
	const themeStyles = Object.entries(themeObj).reduce(
		(acc, [key, { dark, light, shared }]) => {
			const sharedVariables = formatCss(shared);
			return {
				dark: {
					...acc.dark,
					[key]: { ...(base[key] || {}), ...sharedVariables, ...formatCss(dark) }
				},
				light: {
					...acc.light,
					[key]: { ...(base[key] || {}), ...sharedVariables, ...formatCss(light) }
				}
			};
		},
		{ dark: {}, light: {} }
	);

	return { ...acc, [themeName]: themeStyles };
}, {});

export const themeRules = Object.entries(rules).reduce(
	(acc, [themeName, themeRules]) => ({
		...acc,
		[themeName]: themeRules
	}),
	{}
);
