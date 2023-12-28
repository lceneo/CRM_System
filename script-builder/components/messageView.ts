import { notNull } from "../helpers/notNull";
import { cls } from "../helpers/cls";
import { createDiv } from "../html/div";
import { Message, messagesStore } from "../store/messages";

export function createMessageView({ id, className, styles, message, pending = false }: {
    id?: string,
    className?: string,
    message: Message,
    pending?: boolean
    styles?: Partial<CSSStyleDeclaration>
}): [HTMLDivElement, () => void, (show: boolean) => void] {
    const [messageView, closeMessage, showMessage] = createDiv({
        className: 'message-view',
        styles: {
            alignSelf: message.side === 'client' ? 'flex-end' : 'flex-start',
            display: 'flex',
            flexFlow: 'column',
            backgroundColor: 'lightblue',
            color: 'black',
            maxWidth: '95%',
            overflowWrap: 'break-word',
            padding: '5px',
        }
    })
    messageView.classList.add(cls(`message-view-${message.side}`));

    const time = `<time class="${cls('message-view-time')}">${message.timeStamp?.getHours().toString().padStart(2, '0')}:${message.timeStamp?.getMinutes().toString().padStart(2, '0')}</time>`;
    const loading = `<p class="${cls('message-view-time')} ${cls('rotating')}">↺</p>`

    messageView.innerHTML = `
        ${message.side === 'server' ? `<p class="${cls('message-view-author')}">${message.name} ${message.surName}</p>` : ''}
        <p class="${cls('message-view-content')}">${message.content}</p>
        ${message.pending ? loading : time}
    `

    const listeners: (() => void)[] = [];

    /*if (notNull(text)) {
        message.textContent = text;
    }*/
    if (notNull(id)) {
        messageView.id = id;
    }
    if (notNull(className)) {
        messageView.classList.add(cls(className));
    }

    const style = messageView.style;
    Object.assign(style, styles);



    const closeDialog = () => {
        document.body.removeChild(messageView)
        if (listeners) {
            listeners.forEach(l => l());
        }
    }

    const showDialog = (show: boolean) => {
        if (show) {
            messageView.style.visibility = 'visible';
        } else {
            messageView.style.visibility = 'hidden';
        }
    }

    return [messageView, closeDialog, showDialog];
}
