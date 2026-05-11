import { getBevelParams } from './utils.js';

/* COLOURS */

const colours = {
	dark: {
		'b-0': '#2a2b2a',
		'b-1': '#3F403F',
		'b-2': '#343c32',
		'b-3': '#9FB8AD',
		't-0': '#CED0CE',
		't-1': '#E6E8E6',
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
		'b-0': '#E6E8E6',
		'b-1': '#CED0CE',
		'b-2': '#9FB8AD',
		'b-3': '#475841',
		't-0': '#3F403F',
		't-1': '#2a2b2a'
	}
};

const componentColours = {
	dark: {
		button: '#2a2b2a'
	},
	light: {
		'b-0': '#E6E8E6',
		'b-1': '#CED0CE',
		'b-2': '#9FB8AD',
		'b-3': '#475841',
		't-0': '#3F403F',
		't-1': '#2a2b2a'
	}
};

/* BOX-SHADOW */
/* internal variables */
const bevel = getBevelParams({
	hasBevel: true,
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

export { colours, bevel };
