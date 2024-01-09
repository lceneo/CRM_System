import { notNull } from "../helpers/notNull";
import { createButton } from "./button";
import { cls } from "../helpers/cls";
import {stylesStore} from "../store/styles";
import {Customization} from "../customization";
import {createDiv} from "./div";
import {socket} from "../index";

export function createHeader({ text, id, className, styles, onCloseClick }: {
	text?: string,
	id?: string,
	className?: string,
	onCloseClick?: (ev: MouseEvent) => void,
	styles?: Partial<CSSStyleDeclaration>
}): [HTMLDivElement, () => void, (show: boolean) => void] {
	const header = document.createElement('div');
	header.classList.add(cls('border-radius-top'));
	const [closeButton, _, showButton] = createButton({
		text: 'X',
		keepCircle: true,
		className: 'send-button',
		styles: {
			justifySelf: 'flex-end',
			position: 'absolute',
			right: '1%',
			padding: '.8rem',
			visibility: 'hidden',
			color: '#d6d6d6',
		}
	});
	if (onCloseClick) {
		closeButton.addEventListener('click', onCloseClick);
	}
	header.appendChild(closeButton);
	const [onlineIndicator] = createDiv({
		styles: {
			width: '10px',
			height: '10px',
			borderRadius: '100%',
			backgroundColor: 'red',
		}
	});
	header.appendChild(onlineIndicator);

	socket?.onActiveStatus(connected => onlineIndicator.style.backgroundColor = connected ? 'green' : 'red')
	const listeners: (() => void)[] = [];

	if (notNull(text)) {
		header.textContent = text;
	}
	if (notNull(id)) {
		header.id = id;
	}
	if (notNull(className)) {
		header.classList.add(cls(className));
	}

	const style = header.style;
	dropDivStyles(style);
	applyHeaderStyles(style);
	Object.assign(style, styles);

	stylesStore.on('header', (styles) => {
		console.log('setting header styles');
		header.style.padding = styles.padding;
		header.style.backgroundColor = styles.bgc;
	})

	const closeHeader = () => {
		document.body.removeChild(header)
		if (listeners) {
			listeners.forEach(l => l());
		}
	}

	const showHeader = (show: boolean) => {
		if (show) {
			header.style.visibility = 'visible';
			showButton(true);
		} else {
			header.style.visibility = 'hidden';
			showButton(false);
		}
	}

	return [header, closeHeader, showHeader];
}


function applyHeaderStyles(style: CSSStyleDeclaration) {
	Object.assign(style, initHeaderStyles);
}

const initHeaderStyles: Partial<CSSStyleDeclaration> = {
	width: '100%',
	height: '60px',
	display: 'flex',
	alignItems: 'center',
	position: 'relative',
	backgroundColor: '#262626'
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
