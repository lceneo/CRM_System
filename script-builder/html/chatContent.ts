import { notNull } from "../helpers/notNull";
import { cls } from "../helpers/cls";
import { createDiv } from "./div";
import {messagesStore} from "../store/messages";
import {createMessageView} from "../components/messageView";
import {socket} from "../index";
import {stylesStore} from "../store/styles";
import {getIsCustomizing} from "../customization";

export function createChatContent({ text, id, className, styles }: {
	text?: string,
	id?: string,
	className?: string,
	styles?: Partial<CSSStyleDeclaration>
}): [HTMLDivElement, () => void, (show: boolean) => void] {
	const [divWrapper, closeDivWrapper, showDivWrapper] = createDiv({
		className: className || 'chat-content-wrapper',
		styles: {
			height: '100%',
			position: 'relative',
			display: 'flex',
			flexDirection: 'column',
			padding: '5px',
			overflowY: 'auto',
		}
	})
	const [divMessages, closeDivMessages, showDivMessages] = createDiv({
		className: 'chat-content-messages',
		styles: {
			display: 'flex',
			flexFlow: 'column',
			minHeight: 'unset',
			maxHeight: 'unset',
			visibility: 'hidden',
			gap: '5px',

		}
	})
	const [divPending, closeDivPending, showDivPending] = createDiv({
		className: 'chat-content-messages-pending',
		styles: {
			display: 'flex',
			flexFlow: 'column',
			alignItems: 'flex-end',
			minHeight: 'unset',
			maxHeight: 'unset',
			gap: '5px',
			marginTop: '5px',
		}
	})

	messagesStore.items.forEach(message => {
			const [msgView] = createMessageView({
				message
			})
			divMessages.appendChild(msgView);
		})

	messagesStore.onItemsAdd((message) => {
		const [msgView] = createMessageView({
			message
		})
		divMessages.appendChild(msgView);
		if (socket?.waitingForMessageSuccess === 0) {
			divPending.replaceChildren();
		}
		divWrapper.scroll(0, divWrapper.scrollHeight)
	});
	messagesStore.onPendingChange((messages) => {
		for (const child of divPending.children) {
			child.remove();
		}
		divPending.append(...messages.map(m => createMessageView({message: m})[0]))
		divWrapper.scroll(0, divWrapper.scrollHeight);
	});

	const listeners: (() => void)[] = [];

	if (notNull(text)) {
		divWrapper.textContent = text;
	}
	if (notNull(id)) {
		divWrapper.id = id;
	}
	if (notNull(className)) {
		divWrapper.classList.add(cls(className));
	}

	const style = divWrapper.style;
	Object.assign(style, styles);

	stylesStore.on('content', styles => {
		divWrapper.style.backgroundColor = styles.bgc;
		divWrapper.style.padding = styles.padding;
	})

	const closeDialog = () => {
		document.body.removeChild(divWrapper)
		if (listeners) {
			listeners.forEach(l => l());
		}
	}

	const showDialog = (show: boolean) => {
		if (show) {
			divWrapper.style.visibility = 'visible';
			showDivMessages(true);
			showDivPending(true);
		} else {
			divWrapper.style.visibility = 'hidden';
			showDivMessages(false);
			showDivPending(false);
		}
	}

	divWrapper.appendChild(divMessages);
	divWrapper.appendChild(divPending);

	return [divWrapper, closeDialog, showDialog];
}
