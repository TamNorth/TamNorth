import * as cockpit from "./cockpit.js"

// function objectToCss(mode) {
//     if (!!mode) return Object.entries(mode).map((property) => property.join(": ")).join("; ") + "; "
// }

function formatCss(mode) {
    if (!!mode) return Object.entries(mode).reduce((acc, [name, value]) => (
        {...acc, [name]: value.split("\n").join("")})
        , {}
    )
}

export const themes = Object.entries({cockpit})
    .reduce((acc, [themeName, themeObj]) => {
        const themeStyles = Object.entries(themeObj).reduce((acc, [key, {dark, light, shared}]) => {
            const sharedVariables = formatCss(shared)
            return {
                dark: {...acc.dark, [key]: {...sharedVariables, ...formatCss(dark)}},
                light: {...acc.light, [key]: {...sharedVariables, ...formatCss(light)}}
            }
        }, {dark: {}, light: {}})

        return {...acc, [themeName]: themeStyles}
    }, {})