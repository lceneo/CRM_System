import {notNull} from "../helpers/notNull";
import {cls} from "../helpers/cls";

export function createLabel({ text, icon, id, className, styles, forId }: {
    text?: string,
    icon?: string,
    forId: string,
    id?: string,
    className?: string,
    styles?: Partial<CSSStyleDeclaration>
}): [HTMLLabelElement, Function, (show: boolean) => any] {
    const label = document.createElement('label')
    label.setAttribute('for', forId);

    const listeners: (() => void)[] = [];

    if (notNull(text)) {
        label.textContent = text;
    }
    if (notNull(icon)) {
        label.innerHTML = icon;
    }
    if (notNull(id)) {
        label.id = id;
    }
    if (notNull(className)) {
        label.classList.add(cls(className));
    }

    const style = label.style;
    dropLabelStyles(style);
    /*applyHeaderStyles(style);*/
    Object.assign(style, styles);


    const closeLabel = () => {
        document.body.removeChild(label)
        if (listeners) {
            listeners.forEach(l => l());
        }
    }

    const showLabel = (show: boolean) => {
        if (show) {
            label.style.visibility = 'visible';
        } else {
            label.style.visibility = 'hidden';
        }
    }

    return [label, closeLabel, showLabel];
}

function dropLabelStyles(style: CSSStyleDeclaration) {
    style.cssText = `display: inline;
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
    border: none;
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
    line-height: 1;
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
    color: inherit;`;
}
