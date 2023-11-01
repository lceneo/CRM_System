export function addEventListener<E extends Element, K extends keyof EventMap<E>>
(el: E,
 type: K ,
 handler: EventHandler<E, K>,
 options?: {
     add?: boolean | AddEventListenerOptions | undefined,
     remove?: boolean | EventListenerOptions | undefined
 }) {
    el.addEventListener(type as string, handler as EventListenerOrEventListenerObject, options?.add);

    return () => el.removeEventListener(type as string, handler as EventListenerOrEventListenerObject, options?.remove);
}

export type Element = HTMLElement | Window | Document;

export type EventMap<E extends Element> =
    E extends HTMLElement ? HTMLElementEventMap :
        E extends Window ? WindowEventMap :
            E extends Document ? DocumentEventMap :
                never;

export type EventHandler<E extends Element, K extends keyof EventMap<E>> =
    (this: E, ev: EventMap<E>[K]) => any
    | EventListenerOrEventListenerObject
