import {execute} from "./app";
import {widgetInit} from "./requests/widgetInit";
import {HubConnection} from "@microsoft/signalr";
import {HTTPS_PORT, prefix, SERVER_IP, SIGNALR_IP} from "./const";
import {cssStyles} from "./styles";
import {SocketService} from "./service/socket";
import {Customization, DefaultCustomization, getIsCustomizing} from "./customization";
import {stylesStore} from "./store/styles";
import {ManagerData} from "./service/localStorage";

export let socket: SocketService | null;
(async () => {
    const s = await SocketService.New();
    if (!s) {
        console.warn('socket error');
    } else {
        socket = s;
        console.log('socket implanted')
    }
})()

export interface GlobalState {
    hub: HubConnection | null;
    token: string | null;
    chatId: string | null;
	styles: Customization;
    manager: ManagerData | null;
}

let isCustomizing = false;

export const STATE: GlobalState = {
    hub: null,
    token: null,
    chatId: null,
	styles: DefaultCustomization,
    manager: null,
}

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(cssStyles);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];

async function waitForSocket(count = 5) {
    if (socket || getIsCustomizing()) return socket;
    if (!socket) count--;
    if (count < 0) throw new Error();

    await new Promise(res => setTimeout(() => res(true), 1000))

    return waitForSocket(count);
}

(async () => {
    await waitForSocket().catch(console.error)
    socket!?.onError(async () => {
        localStorage.setItem(`${prefix}-token`, '');
        localStorage.setItem(`${prefix}-chatId`, '');
        const {token, chatId} = await widgetInit();
        STATE.token = token;
        STATE.chatId = chatId;
    })
    console.log('isCustomizing', getIsCustomizing());
    console.log("Connected to SignalR server");
    let [button, showButton] = execute(STATE.hub!, SERVER_IP);
    (window as any).showWidget = (show: boolean) => {
        showButton(show)
    };
    (window as any).applyStylesWidget = (styles: Customization) => {
		stylesStore.set(styles);
	}
})();
