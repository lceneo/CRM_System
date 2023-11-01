import {HubConnection} from "@microsoft/signalr";
import {addEventListener} from "./helpers/addEventListener";
import {createButton} from "./html/button";
import {createDialog} from "./html/dialog";
import {useOnClickOutside} from "./helpers/useOnClickOutside";

export function execute(connection: HubConnection, ip: string) {
    const [button, removeButton] = createButton({text: 'open dialog'});
    document.body.appendChild(button);
    addEventListener(button, 'click', () => {
        button.disabled = true;
        const [dialog, removeDialog] = createDialog({});
        setTimeout(() => {
            const removeOutsideListener = useOnClickOutside(dialog, () => closeDialog())
            const closeDialog = () => {
                removeOutsideListener();
                removeDialog();
                button.disabled = false;
            }
            document.body.appendChild(dialog);
        });
    });
}


