import {addEventListener, EventHandler} from "./addEventListener";

export function useOnClickOutside(el: HTMLElement, callback: (ev: MouseEvent) => any) {
    const removeEvent = addEventListener(el, 'click', ev => ev.stopPropagation());

    return addEventListener(document, 'click', ev => {
        removeEvent();
        callback(ev);
    });
}
