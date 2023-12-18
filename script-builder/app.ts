import { HubConnection } from "@microsoft/signalr";
import { addEventListener } from "./helpers/addEventListener";
import { createButton } from "./html/button";
import { createDialog, PositionY } from "./html/dialog";
import { useOnClickOutside } from "./helpers/useOnClickOutside";

export function execute(connection: HubConnection, ip: string) {
    const [button, removeButton, showButton] = createButton({
        text: '+',
        keepCircle: true,
        className: 'open-widget-button',
    });
    const [dialog, removeDialog, showDialog] = createDialog({
        positionY: PositionY.LEFT,
        onClose: () => {
            button.disabled = false;
            showButton(true)
        },
        className: 'chat-dialog-wrapper'
    });
    document.body.appendChild(button);
    showDialog(false);
    document.body.appendChild(dialog);
    addEventListener(button, 'click', () => {
        button.disabled = true;
        showButton(false);
        showDialog(true);
        /*setTimeout(() => {
            const removeOutsideListener = useOnClickOutside(dialog, () => closeDialog())
            const closeDialog = () => {
                removeOutsideListener();
                showDialog(false);
                button.disabled = false;
                showButton( true);
            }
            document.body.appendChild(dialog);
        });*/
    });
}


