import {notNull} from "../helpers/notNull";

export function createButton({text, id, className}: {text?: string, id?: string, className?: string}): [HTMLButtonElement, () => void] {
    const button = document.createElement('button');

    if (notNull(text)) button.textContent = text;
    if (notNull(id)) button.id = id;
    if (notNull(className)) button.classList.add(className);

    const style = button.style;
    style.position = 'fixed';
    style.right = '5%';
    style.bottom = '5%';

    style.backgroundColor = 'orange';
    style.outline = 'none';
    style.border = 'none';

    return [button, () => document.removeChild(button)];
}
