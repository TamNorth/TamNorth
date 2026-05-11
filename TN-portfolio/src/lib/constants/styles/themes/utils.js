export function getBevelParams({ shared, ...modes }) {
	const [dark, light] = Object.values(modes).map((mode) => {
		const {
			shadowLength,
			shadowDirectionX,
			shadowDirectionY,
			shadowVisibility,
			shadowColour,
			insetHighlightColour,
			bevelSize,
			bevelBlur,
			bevelVisibility
		} = { ...shared, ...mode };

		return {
			'external-shadow': `
                        color-mix(in hsl, ${shadowColour} ${shadowVisibility}, transparent) 
                            calc(${shadowLength} * ${shadowDirectionX})
                            calc(${shadowLength} * ${shadowDirectionY}) 
                            3px 
                            0,
                        rgb(0, 0, 0, ${shadowVisibility}) 0 0 1px 1px
                    `,
			1: `
                        inset 
                            color-mix(in hsl, ${insetHighlightColour} ${bevelVisibility}, transparent) 
                            calc(${bevelSize} * ${shadowDirectionX}) 
                            calc(${bevelSize} * ${shadowDirectionY}) 
                            ${bevelBlur} 
                            0,
                        inset 
                            color-mix(in hsl, ${shadowColour} ${shadowVisibility}, transparent) 
                            calc(${bevelSize} * ${-shadowDirectionX}) 
                            calc(${bevelSize} * ${-shadowDirectionY}) 
                            ${bevelBlur} 
                            0
                    `,
			2: `
                        inset 
                            color-mix(in hsl, ${insetHighlightColour} ${bevelVisibility}, transparent) 
                            calc(${bevelSize} * ${0.5 * shadowDirectionX}) 
                            calc(${bevelSize} * ${0.5 * shadowDirectionY}) 
                            ${bevelBlur} 
                            calc(${bevelSize} * 0.5),
                        inset 
                            color-mix(in hsl, ${shadowColour} ${shadowVisibility}, transparent) 
                            calc(${bevelSize} * ${-0.5 * shadowDirectionX}) 
                            calc(${bevelSize} * ${-0.5 * shadowDirectionY}) 
                            ${bevelBlur} 
                            0`,
			'border-radius-tile': `calc(${bevelSize} * 0.5)`
		};
	});
	return { dark, light };
}
