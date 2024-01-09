import { HubConnection } from "@microsoft/signalr";
import { addEventListener } from "./helpers/addEventListener";
import { createButton } from "./html/button";
import { createDialog, PositionY } from "./html/dialog";
import { useOnClickOutside } from "./helpers/useOnClickOutside";
import {Customization} from "./customization";

export function execute(connection: HubConnection, ip: string): [HTMLElement, (show: boolean)=> any] {
    const [button, removeButton, showButton] = createButton({
        text: '+',
        keepCircle: true,
        className: 'open-widget-button',
        styles: {
            zIndex: '10000',
        }
    });
    const [dialog, removeDialog, showDialog] = createDialog({
        positionY: PositionY.LEFT,
        onClose: () => {
            button.disabled = false;
            showButton(true)
        },
        className: 'chat-dialog-wrapper',
        styles: {
            zIndex: '10000',
        }
    });
    document.body.appendChild(button);
    showDialog(false);
    document.body.appendChild(dialog);
    const onButtonClick = () => {
        button.disabled = true;
        showButton(false);
        showDialog(true);
    }
    addEventListener(button, 'click', onButtonClick);
    return [button, showButton]
}

