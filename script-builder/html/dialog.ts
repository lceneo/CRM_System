import { notNull } from "../helpers/notNull";
import { useOnClickOutside } from "../helpers/useOnClickOutside";
import { socket, STATE } from "../index";
import { createHeader } from "./header";
import { createFooter } from "./footer";
import { cls } from "../helpers/cls";
import {Message, messagesStore} from "../store/messages";
import {createChatContent} from "./chatContent";

export enum PositionX {
	BOTTOM,
	TOP,
}

export enum PositionY {
	LEFT,
	RIGHT,
}

export function createDialog({ text, id, className, positionX = PositionX.BOTTOM, positionY = PositionY.RIGHT, styles, onClose }: {
	text?: string,
	id?: string,
	positionX?: PositionX,
	positionY?: PositionY,
	className?: string,
	onClose?: () => void;
	styles?: Partial<CSSStyleDeclaration>
}): [HTMLDivElement, () => void, (show: boolean) => void] {
	const dialog = document.createElement('div')
	dialog.classList.add(cls('border-radius-top'), cls('border-radius-bottom'))

	const listeners: (() => void)[] = [];

	if (notNull(text)) {
		dialog.textContent = text;
	}
	if (notNull(id)) {
		dialog.id = id;
	}
	if (notNull(className)) {
		dialog.classList.add(cls(className));
	}

	const style = dialog.style;
	dropDivStyles(style);
	applyDialogStyles(style);
	Object.assign(style, styles);

	setPositionX(positionX, style);
	setPositionY(positionY, style);

	const closeDialog = () => {
		document.body.removeChild(dialog)
		if (listeners) {
			listeners.forEach(l => l());
		}
	}

	const messages = [];
	let pending: any[] = [];

	async function sendMessage(msg: string) {
		const message = new Message(msg, new Date(), 'client');
		messagesStore.setPending(message);
		const msgTimestamp = await socket?.sendMessage(msg);
		messagesStore.movePending(message, {timeStamp: msgTimestamp})
	}

	const [header, closeHeader, showHeader] = createHeader({onCloseClick: () => onCloseDialog() });
	const [footer, closeFooter, showFooter] = createFooter({
		className: 'chat-footer',
		onSend: sendMessage,
	});

	const [chatContent, closeChatContent, showChatContent] = createChatContent({className: 'chat-content'})
	const showDialog = (show: boolean) => {
		if (show) {
			dialog.style.display = 'flex';
			showHeader(true);
			showFooter(true);
			showChatContent(true);
		} else {
			dialog.style.display = 'none';
			showHeader(false);
			showFooter(false);
			showChatContent(false);
		}
	}

	function onCloseDialog() {
		onClose && onClose();
		showDialog(false);
	}

	dialog.appendChild(header);
	dialog.appendChild(chatContent);
	dialog.appendChild(footer);

	return [dialog, closeDialog, showDialog];
}

function setPositionX(position: PositionX, styles: CSSStyleDeclaration) {
    switch(position) {
        case PositionX.BOTTOM:
			styles.top = '';
            styles.bottom = '0%';
            break;
        case PositionX.TOP:
            styles.top = '0%';
			styles.bottom = '';
            break;
    }
}

function setPositionY(position: PositionY, styles: CSSStyleDeclaration) {
	switch(position) {
		case PositionY.LEFT:
			styles.right = '';
			styles.left = '0%';
			break;
		case PositionY.RIGHT:
			styles.right = '0%';
			styles.left = '';
			break;
	}
}

function applyDialogStyles(style: CSSStyleDeclaration) {
    style.position = 'fixed';
    style.width = '30%';
    style.height = '50%';
    style.backgroundColor = 'grey';
	style.display = 'flex';
	style.flexFlow = 'column';
	style.margin = '10px';
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
