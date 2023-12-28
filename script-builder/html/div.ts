import { notNull } from "../helpers/notNull";
import { useOnClickOutside } from "../helpers/useOnClickOutside";
import { STATE } from "../index";
import { sendMessage } from "../requests/sendMessage";
import { createHeader } from "./header";
import { createFooter } from "./footer";
import { cls } from "../helpers/cls";

export function createDiv({ text, id, className, styles }: {
	text?: string,
	id?: string,
	className?: string,
	styles?: Partial<CSSStyleDeclaration>
}): [HTMLDivElement, () => void, (show: boolean) => void] {
	const div = document.createElement('div')

	const listeners: (() => void)[] = [];

	if (notNull(text)) {
		div.textContent = text;
	}
	if (notNull(id)) {
		div.id = id;
	}
	if (notNull(className)) {
		div.classList.add(cls(className));
	}

	const style = div.style;
	console.log(styles);
	styles?.height && console.log(style.height);
	dropDivStyles(style);
	styles?.height && console.log(style.height);
	Object.assign(style, styles);
	styles?.height && console.log(style.height);



	const closeDialog = () => {
		document.body.removeChild(div)
		if (listeners) {
			listeners.forEach(l => l());
		}
	}

	const showDialog = (show: boolean) => {
		if (show) {
			div.style.visibility = 'visible';
		} else {
			div.style.visibility = 'hidden';
		}
	}

	return [div, closeDialog, showDialog];
}

function dropDivStyles(style: CSSStyleDeclaration) {
	style.cssText = `display: block;
position: static;
float: none;
clear: none;
visibility: visible;
opacity: 1;
overflow: visible;
overflow-x: visible;
overflow-y: visible;
clip: auto;
z-index: auto;
zoom: 1;
max-height: none;
max-width: none;
min-height: 0px;
min-width: 0px;
height: auto;
width: auto;
top: auto;
right: auto;
bottom: auto;
left: auto;
margin-top: 0px;
margin-right: 0px;
margin-bottom: 0px;
margin-left: 0px;
outline-style: none;
outline-width: 0px;
outline-color: invert;
border-top-style: none;
border-right-style: none;
border-bottom-style: none;
border-left-style: none;
border-top-width: 0px;
border-right-width: 0px;
border-bottom-width: 0px;
border-left-width: 0px;
border-top-color: invert;
border-right-color: invert;
border-bottom-color: invert;
border-left-color: invert;
border-image-source: none;
border-image-slice: 100%;
border-image-width: 1;
border-image-outset: 0px;
border-image-repeat: stretch;
border-collapse: separate;
border-spacing: 0px 0px;
background-color: transparent;
background-image: none;
background-position-x: 0%;
background-position-y: 0%;
background-size: auto auto;
background-repeat-x: repeat;
background-repeat-y: repeat;
background-attachment: scroll;
background-origin: padding-box;
background-clip: border-box;
background-color-2: transparent;
background-position-x-2: 0%;
background-position-y-2: 0%;
background-size-2: auto auto;
background-repeat-x-2: repeat;
background-repeat-y-2: repeat;
background-attachment-2: scroll;
background-origin-2: padding-box;
background-clip-2: border-box;
box-sizing: border-box;
font-family: Arial, sans-serif;
font-style: normal;
font-weight: normal;
font-size: medium;
line-height: normal;
font-size-adjust: none;
font-stretch: normal;
font-variant-ligatures: normal;
font-variant-caps: normal;
font-variant-numeric: normal;
font-variant-east-asian: normal;
text-align: start;
text-align-last: auto;
text-decoration-line: none;
text-decoration-style: solid;
text-decoration-color: invert;
text-decoration-thickness: auto;
text-decoration-skip-ink: auto;
text-underline-offset: auto;
text-decoration-line-2: none;
text-decoration-style-2: solid;
text-decoration-color-2: invert;
text-decoration-thickness-2: auto;
text-decoration-skip-ink-2: auto;
text-underline-offset-2: auto;
text-emphasis-style: none;
text-emphasis-color: invert;
text-emphasis-position-x: over right;
text-emphasis-position-y: over right;
text-emphasis-style-2: none;
text-emphasis-color-2: invert;
text-emphasis-position-x-2: over right;
text-emphasis-position-y-2: over right;
vertical-align: baseline;
white-space: normal;
word-spacing: normal;
letter-spacing: normal;
text-transform: none;
direction: ltr;
unicode-bidi: normal;
color: black;`
}
