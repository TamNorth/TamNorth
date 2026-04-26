import * as unformattedThemes from "./cockpit.js"

// function objectToCss(mode) {
//     if (!!mode) return Object.entries(mode).map((property) => property.join(": ")).join("; ") + "; "
// }

function formatCss(mode) {
    if (!!mode) return Object.entries(mode).reduce((acc, [name, value]) => (
        {...acc, [name]: value.split("\n").join("")})
        , {}
    )
}

export const themes = Object.entries(unformattedThemes)
    .reduce((acc, [themeName, themeObj]) => {
        const themeStyles = themeObj.reduce((acc, {dark, light}) => {
            return {
                dark: {...acc.dark, ...formatCss(dark)},
                light: {...acc.light, ...formatCss(light)}
            }
        }, {dark: {}, light: {}})

        return {...acc, [themeName]: themeStyles}
    }, {})