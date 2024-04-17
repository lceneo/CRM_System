import {prefix} from "../const";

export const starStyles = `
:root {
\t--enlarge: scale(1.25);
\t--page-color: steelblue;
\t--star-primary-color: gold;
\t--star-secondary-color: darkgoldenrod;
}

.${prefix}-star-container {
\tdisplay: grid;
\tfont-size: clamp(1.5em, 10vw, 8em);
\tgrid-auto-flow: column;
}

/* reset native input styles */
.${prefix}-star {
\t-webkit-appearance: none;
\talign-items: center;
\tappearance: none;
\tcursor: pointer;
\tdisplay: grid;
\tfont: inherit;
\theight: 1.15em;
\tjustify-items: center;
\tmargin: 0;
\tplace-content: center;
\tposition: relative;
\twidth: 1.15em;
}

@media (prefers-reduced-motion: no-preference) {
\t.${prefix}-star {
\t\ttransition: all 0.25s;
\t}

\t.${prefix}-star:before,
\t.${prefix}-star:after {
\t\ttransition: all 0.25s;
\t}
}

.${prefix}-star:before,
.${prefix}-star:after {
\tcolor: var(--star-primary-color);
\tposition: absolute;
}

.${prefix}-star:before {
\tcontent: "☆";
}

.${prefix}-star:after {
\tcontent: "✦";
\tfont-size: 25%;
\topacity: 0;
\tright: 20%;
\ttop: 20%;
}

/* The checked radio button and each radio button preceding */
.${prefix}-star:checked:before,
.${prefix}-star:has(~ .${prefix}-star:checked):before {
\tcontent: "★";
}

.${prefix}-star-two:checked:after,
.${prefix}-star:has(~ .${prefix}-star-two:checked):after {
\topacity: 1;
\tright: 14%;
\ttop: 10%;
}

.${prefix}-star-three:checked:before,
.${prefix}-star:has(~ .${prefix}-star-three:checked):before {
\ttransform: var(--enlarge);
}

.${prefix}-star-three:checked:after,
.${prefix}-star:has(~ .${prefix}-star-three:checked):after {
\topacity: 1;
\tright: 8%;
\ttop: 2%;
\ttransform: var(--enlarge);
}

.${prefix}-star-four:checked:before,
.${prefix}-star:has(~ .${prefix}-star-four:checked):before {
\ttext-shadow: 0.05em 0.033em 0px var(--star-secondary-color);
\ttransform: var(--enlarge);
}

.${prefix}-star-four:checked:after,
.${prefix}-star:has(~ .${prefix}-star-four:checked):after {
\topacity: 1;
\tright: 8%;
\ttop: 2%;
\ttransform: var(--enlarge);
}

.${prefix}-star-five:checked:before,
.${prefix}-star:has(~ .${prefix}-star-five:checked):before {
\ttext-shadow: 0.05em 0.033em 0px var(--star-secondary-color);
\ttransform: var(--enlarge);
}

.${prefix}-star-five:checked:after,
.${prefix}-star:has(~ .${prefix}-star-five:checked):after {
\topacity: 1;
\tright: 8%;
\ttext-shadow: 0.14em 0.075em 0px var(--star-secondary-color);
\ttop: 2%;
\ttransform: var(--enlarge);
}


.${prefix}-star:focus {
\toutline: none;
}

.${prefix}-star:focus-visible {
\tborder-radius: 8px;
\toutline: 2px dashed var(--star-primary-color);
\toutline-offset: 8px;
\ttransition: all 0s;
}

`
