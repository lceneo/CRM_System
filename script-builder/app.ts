import { HubConnection } from "@microsoft/signalr";
import { addEventListener } from "./helpers/addEventListener";
import { createButton } from "./html/button";
import { createDialog, PositionY } from "./html/dialog";
import { useOnClickOutside } from "./helpers/useOnClickOutside";

export function execute(connection: HubConnection, ip: string) {
    let buttonStyles: Partial<CSSStyleDeclaration> = {
        fontSize: '24px',
        padding: '10px',
        width: '2em',
        height: '2em'
    }


    const [button, removeButton, showButton] = createButton({
        text: '+',
        styles: buttonStyles
    });
    const [dialog, removeDialog, showDialog] = createDialog({
        positionY: PositionY.LEFT
    });
    document.body.appendChild(button);
    showDialog(false);
    document.body.appendChild(dialog);
    addEventListener(button, 'click', () => {
        button.disabled = true;
        showButton(false);
        showDialog(true);
        setTimeout(() => {
            const removeOutsideListener = useOnClickOutside(dialog, () => closeDialog())
            const closeDialog = () => {
                removeOutsideListener();
                showDialog(false);
                button.disabled = false;
                showButton( true);
            }
            document.body.appendChild(dialog);
        });
    });
}


