/* COLOURS */

const colours = {
	dark: {
		b0: '#2a2b2a',
		b1: '#3F403F',
		b2: '#343c32',
		b3: '#9FB8AD',
		t0: '#CED0CE',
		t1: '#F3F3CF'
		// 'error': '#B3001B',
		// 'alert': '#DD6031',
		// 'warn': '#FF8811',
		// 'positive': '#29BF12',
		// 'info': '#507DBC',
		// 'temp': '#5E0B15',
		// 'temp2': '#A8763E',
		// 'temp3': '#DB504A'
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

const fonts = {
	shared: {
		base: 'quantico-regular',
		header: 'synemono-regular',
		subheader: 'turretroad-bold'
	}
};

export const variables = { colours, fonts };

/* RULES */

export const rules = `
	background: red;

	.tile {
		background-color: black, inherit;
		background-clip: padding-box, border-area; 
		background-attachment: scroll, fixed;
		border: 5px;
	}
`;
