import { getBevelParams } from "./utils.js"

/* COLOURS */

const baseColours = { 
    dark: {
        "colour-b-0": '#2a2b2a',
        "colour-b-1": '#3F403F',
        "colour-b-2": '#343c32',
        "colour-b-3": '#9FB8AD',
        "colour-t-0": '#CED0CE',
        "colour-t-1": '#E6E8E6',
        "colour-error": '#B3001B',
        "colour-alert": '#DD6031',
        "colour-warn": '#FF8811',
        "colour-positive": '#29BF12',
        "colour-info": '#507DBC',
        "colour-temp": '#5E0B15',
        "colour-temp2": '#A8763E',
        "colour-temp3": '#DB504A',
    },
    light: {
        "colour-b-0": '#E6E8E6',
        "colour-b-1": '#CED0CE',
        "colour-b-2": '#9FB8AD',
        "colour-b-3": '#475841',
        "colour-t-0": '#3F403F',
        "colour-t-1": '#2a2b2a',
    },
}

const componentColours = { 
    dark: {
        "colour-button": '#2a2b2a',
    },
    light: {
        "colour-b-0": '#E6E8E6',
        "colour-b-1": '#CED0CE',
        "colour-b-2": '#9FB8AD',
        "colour-b-3": '#475841',
        "colour-t-0": '#3F403F',
        "colour-t-1": '#2a2b2a',
    },
}

/* BOX-SHADOW */
/* internal variables */
const bevel = getBevelParams({
    hasBevel: true,
    dark: {
        shadowLength: "2px",
        shadowDirectionX: -1,
        shadowDirectionY: 1,
        insetHighlightColour: "rgb(255, 200, 150)",
    },
    light: {
        shadowLength: "2px",
        shadowDirectionX: 1,
        shadowDirectionY: 1,
        insetHighlightColour: "rgb(253, 255, 150)",
    },
    shared: {
        shadowVisibility: "50%",
        shadowColour: "black",
        bevelSize: "2px",
        bevelBlur: "2px", // = bevelSize
        bevelVisibility: "20%",
    }
})

export {baseColours, bevel}