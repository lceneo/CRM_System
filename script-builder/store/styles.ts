import {Customization, DefaultCustomization} from "../customization";

class StylesStore {
    styles: Customization = DefaultCustomization;
    listeners: {
        [p: string]: ((styles: any) => any)[]
    } = Object.fromEntries(Object.entries(DefaultCustomization).map(([k, v]) => [k, []]))

    on<T extends keyof Customization>(type: T, listener: (styles: Customization[T]) => any) {
        this.listeners[type].push(listener);
        listener(this.styles[type])
    }

    set(styles: Customization) {
        this.styles = styles
        const typeListeners = Object.entries(this.listeners) as Array<[keyof Customization, ((styles: any) => any)[]]>;
        typeListeners.forEach(([type, listeners]) => {
            listeners.forEach(listener => listener(this.styles[type]))
        })
    }
}

export const stylesStore = new StylesStore();
