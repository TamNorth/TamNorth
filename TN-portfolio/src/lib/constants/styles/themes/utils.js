export function getBevelParams({hasBevel, shared, ...modes}) {
        if (!hasBevel) {
            const noBevel = {
                "--external-shadow": `
                    rgb(0, 0, 0, 0) 0 0 0 0
                `,
                "--bevel-1": `
                    rgb(0, 0, 0, 0) 0 0 0 0
                `,
                "--bevel-2": `
                    rgb(0, 0, 0, 0) 0 0 0 0
                `,
                "--border-radius-tile": `0`,
            }
            return {dark: noBevel, light: noBevel}
        } else {
            const [dark, light] = Object.values(modes).map(mode => {
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
                } = {...shared, ...mode}

                return {
                    "--external-shadow": `
                        color-mix(in hsl, ${shadowColour} ${shadowVisibility}, transparent) 
                            calc(${shadowLength} * ${shadowDirectionX})
                            calc(${shadowLength} * ${shadowDirectionY}) 
                            3px 
                            0,
                        rgb(0, 0, 0, ${shadowVisibility}) 0 0 1px 1px
                    `,
                    "--bevel-1": `
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
                    "--bevel-2": `
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
                    "--border-radius-tile": `calc(${bevelSize} * 0.5)`,
                }
            })
            return {dark, light}
        }
    }