import { notNull } from "../helpers/notNull";
import { cls } from "../helpers/cls";
import { createDiv } from "../html/div";
import { Message, messagesStore } from "../store/messages";
import {stylesStore} from "../store/styles";
import {Customization, DefaultMessage, DefaultSection, messageSideToAlignSelf} from "../customization";
import {getStatic} from "../requests/getStatic";
import {prefix} from "../const";

export function createMessageView({ id, className, styles, message, pending = false }: {
    id?: string,
    className?: string,
    message: Message,
    pending?: boolean
    styles?: Partial<CSSStyleDeclaration>
}): [HTMLDivElement, () => void, (show: boolean) => void] {
    const joinStyles = {
        textAlign: 'center',
        fontSize: '13px',
        lineHeight: '2em',
        backgroundColor: '#b29b57',
        display: 'block',
        height: undefined,
        margin: '0',
        borderRadius: '10px',
    }
    const [messageView, closeMessage, showMessage] = createDiv({
        className: 'message-view',
        styles: message.side === 'join' ? joinStyles : {
            alignSelf: message.side === 'client' ? 'flex-end' : message.side === 'server' ? 'flex-start' : undefined,
            display: 'flex',
            flexFlow: 'column',
            backgroundColor: 'lightblue',
            color: 'black',
            maxWidth: '95%',
            overflowWrap: 'break-word',
            padding: '5px',
        }
    })
    messageView.classList.add(cls(`${prefix}-message-view-${message.side}`));

    const author = `${message.side === 'server' ? `<p class="${cls('message-view-author')}">${message.name} ${message.surname}</p>` : ''}`
    const time = `<time class="${cls('message-view-time')}">${message.timeStamp?.getHours().toString().padStart(2, '0')}:${message.timeStamp?.getMinutes().toString().padStart(2, '0')}</time>`;
    const loading = `<p class="${cls('message-view-time')} ${cls('rotating')}">↺</p>`

    messageView.innerHTML = `
        ${author}
        <p class="${cls('message-view-content')}">${message.content}</p>
        ${message.pending ? loading : time}
    `
    if (message.side === 'join') {
        messageView.innerHTML = `<p class="${cls('message-view-content')}">${message.content}</p>`
    }
    if (message.fileKey) {
        messageView.innerHTML = author;
        getStatic(message.fileKey)
            .then(blob => {
                const url = URL.createObjectURL(blob);
                const extIs = (ext: string) => message.content.endsWith(ext);
                const isImage = extIs('png') || extIs('jpg') || extIs('svg') || extIs('gif');
                console.log(blob.type, isImage, message.content);
                if (isImage) {
                    const img = document.createElement('img');
                    img.src = url
                    messageView.innerHTML += img.outerHTML;
                } else {
                    const link = document.createElement('a');
                    link.classList.add(cls('link'));
                    const fileIcon = document.createElement('icon');
                    fileIcon.classList.add(cls('icon'));
                    const fileIconText = document.createTextNode('🗈');
                    fileIcon.append(fileIconText);
                    const linkName = document.createTextNode(message.content);
                    link.appendChild(fileIcon);
                    link.append(linkName);
                    link.href = url;
                    link.download = message.content;
                    messageView.innerHTML += link.outerHTML;
                }
                messageView.innerHTML += time;
            })
    }

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

    let type: 'comeMsg' | 'mngMsg' | 'userMsg'
    const listener = (s: Customization['userMsg' | 'mngMsg' | 'comeMsg']) => {
        const contentS = messageView.querySelector<HTMLParagraphElement>(`.${cls('message-view-content')}`)?.style;
        const timeS = messageView.querySelector<HTMLTimeElement>(`.${cls('message-view-time')}`)?.style;
        mvs.padding = s.padding;
        mvs.backgroundColor = s.bgc;
        mvs.alignSelf = messageSideToAlignSelf[s.side];
        if (contentS) {
            contentS.textAlign = s.content.align;
            contentS.fontSize = `${s.content.size}${s.content.type}`;
            contentS.lineHeight = s.content.lineHeight.toString();
            contentS.color = s.content.color;
        }
        if ('time' in s && timeS) {
            timeS.textAlign = s.time.align;
            timeS.fontSize = `${s.time.size}${s.time.type}`;
            timeS.lineHeight = s.time.lineHeight.toString();
            timeS.color = s.time.color;
        }
    }
    const mvs = messageView.style;
    switch (message.side) {
        case "client":
            type = 'userMsg';
            break
        case "join":
            type = 'comeMsg';
            break
        case "server":
            type = 'mngMsg';
            break
    }
    stylesStore.on(type, listener)

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
