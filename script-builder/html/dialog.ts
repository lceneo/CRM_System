import {notNull} from "../helpers/notNull";
import {useOnClickOutside} from "../helpers/useOnClickOutside";

export function createDialog({text, id, className}: {text?: string, id?: string, className?: string}): [HTMLDivElement, () => void] {
    const dialog = document.createElement('div')
    const listeners: (() => void)[] = [];

    if (notNull(text)) dialog.textContent = text;
    if (notNull(id)) dialog.id = id;
    if (notNull(className)) dialog.classList.add(className);

    const style = dialog.style;
    style.position = 'fixed';
    style.left = '50%';
    style.top = '50%';
    style.transform = 'translate(-50%,-50%)'
    style.width = '50%';
    style.height = '50%';
    style.backgroundColor = 'yellow';

    const closeDialog = () => {
        document.body.removeChild(dialog)
        if (listeners) {
            listeners.forEach(l => l());
        }
    }

    return [dialog, closeDialog];
}
