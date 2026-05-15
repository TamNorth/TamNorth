import { getBevelParams } from './utils.js';

/* COLOURS */

const colours = {
	dark: {
		b0: '#2a2b2a',
		b1: '#3F403F',
		b2: '#343c32',
		b3: '#9FB8AD',
		t0: '#CED0CE',
		t1: '#E6E8E6',
		error: '#B3001B',
		alert: '#DD6031',
		warn: '#FF8811',
		positive: '#29BF12',
		info: '#507DBC',
		temp: '#5E0B15',
		temp2: '#A8763E',
		temp3: '#DB504A'
	},
	light: {
		b0: '#E6E8E6',
		b1: '#CED0CE',
		b2: '#9FB8AD',
		b3: '#475841',
		t0: '#3F403F',
		t1: '#2a2b2a'
	}
};

/* BOX-SHADOW */
/* internal variables */
const bevel = getBevelParams({
	dark: {
		shadowLength: '2px',
		shadowDirectionX: -1,
		shadowDirectionY: 1,
		insetHighlightColour: 'rgb(255, 200, 150)'
	},
	light: {
		shadowLength: '2px',
		shadowDirectionX: 1,
		shadowDirectionY: 1,
		insetHighlightColour: 'rgb(253, 255, 150)'
	},
	shared: {
		shadowVisibility: '50%',
		shadowColour: 'black',
		bevelSize: '2px',
		bevelBlur: '2px', // = bevelSize
		bevelVisibility: '20%'
	}
});

export const variables = { colours, bevel };

/* RULES */

export const rules = `
	.tile {
		border-radius: var(--bevel-border-radius-tile);
		box-shadow: var(--bevel-external-shadow), var(--bevel-1);
	}
`;
