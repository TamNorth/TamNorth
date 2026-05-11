import { getBevelParams } from './utils.js';

/* COLOURS */

function coloursFromEndmembers({ dark, light, primary, secondary }, monochromeMixing) {
	return {
		dark: {
			'b-0': dark,
			'b-1': `color-mix(in hsl, ${dark} 97.5%, ${monochromeMixing ? 'white' : light})`,
			'b-2': `color-mix(in hsl, ${dark} 95%, ${monochromeMixing ? 'white' : light})`,
			'b-3': `color-mix(in hsl, ${dark} 92.5%, ${monochromeMixing ? 'white' : light})`,
			't-1': `color-mix(in hsl, ${light} 95%, ${monochromeMixing ? 'black' : dark})`,
			't-0': light
		},
		light: {
			'b-0': light,
			'b-1': `color-mix(in hsl, ${light} 97.5%, ${monochromeMixing ? 'black' : dark})`,
			'b-2': `color-mix(in hsl, ${light} 95%, ${monochromeMixing ? 'black' : dark})`,
			'b-3': `color-mix(in hsl, ${light} 92.5%, ${monochromeMixing ? 'black' : dark})`,
			't-1': `color-mix(in hsl, ${dark} 95%, ${monochromeMixing ? 'white' : light})`,
			't-0': dark
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
// 	'colour-b-0': '#2a2b2a',
// 	'colour-b-1': '#3F403F',
// 	'colour-b-2': '#343c32',
// 	'colour-b-3': '#9FB8AD',
// 	'colour-t-0': '#CED0CE',
// 	'colour-t-1': '#F3F3CF',
// 	// 'colour-t-1': '#F8F6D9',
// 	// 'colour-t-1': '#7A59AC',
// 	// 'colour-t-1': '#5980ac',
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
// 	'colour-b-0': '#E6E8E6',
// 	'colour-b-1': '#CED0CE',
// 	'colour-b-2': '#9FB8AD',
// 	'colour-b-3': '#475841',
// 	'colour-t-0': '#3F403F',
// 	'colour-t-1': '#2a2b2a'
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
const bevel = getBevelParams({ hasBevel: false });

export { colours, fonts, bevel };
