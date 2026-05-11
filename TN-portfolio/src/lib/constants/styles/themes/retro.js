/* COLOURS */

function coloursFromEndmembers({ dark, light, primary, secondary }, monochromeMixing) {
	return {
		dark: {
			b0: dark,
			b1: `color-mix(in hsl, ${dark} 97.5%, ${monochromeMixing ? 'white' : light})`,
			b2: `color-mix(in hsl, ${dark} 95%, ${monochromeMixing ? 'white' : light})`,
			b3: `color-mix(in hsl, ${dark} 92.5%, ${monochromeMixing ? 'white' : light})`,
			t1: `color-mix(in hsl, ${light} 95%, ${monochromeMixing ? 'black' : dark})`,
			t0: light
		},
		light: {
			b0: light,
			b1: `color-mix(in hsl, ${light} 97.5%, ${monochromeMixing ? 'black' : dark})`,
			b2: `color-mix(in hsl, ${light} 95%, ${monochromeMixing ? 'black' : dark})`,
			b3: `color-mix(in hsl, ${light} 92.5%, ${monochromeMixing ? 'black' : dark})`,
			t1: `color-mix(in hsl, ${dark} 95%, ${monochromeMixing ? 'white' : light})`,
			t0: dark
		}
	};
}

const colours = coloursFromEndmembers(
	{
		dark: '#0f0f0f',
		light: '#e8cff3'
	},
	false
);
// dark: {
// 	'colour-b0': '#2a2b2a',
// 	'colour-b1': '#3F403F',
// 	'colour-b2': '#343c32',
// 	'colour-b3': '#9FB8AD',
// 	'colour-t0': '#CED0CE',
// 	'colour-t1': '#F3F3CF',
// 	// 'colour-t1': '#F8F6D9',
// 	// 'colour-t1': '#7A59AC',
// 	// 'colour-t1': '#5980ac',
// 	'colour-error': '#B3001B',
// 	'colour-alert': '#DD6031',
// 	'colour-warn': '#FF8811',
// 	'colour-positive': '#29BF12',
// 	'colour-info': '#507DBC',
// 	'colour-temp': '#5E0B15',
// 	'colour-temp2': '#A8763E',
// 	'colour-temp3': '#DB504A'
// },
// light: {
// 	'colour-b0': '#E6E8E6',
// 	'colour-b1': '#CED0CE',
// 	'colour-b2': '#9FB8AD',
// 	'colour-b3': '#475841',
// 	'colour-t0': '#3F403F',
// 	'colour-t1': '#2a2b2a'
// }

const fonts = {
	shared: {
		base: 'quantico-regular',
		header: 'synemono-regular',
		subheader: 'turretroad-bold'
	}
};

/* BOX-SHADOW */
/* internal variables */

export { colours, fonts };
