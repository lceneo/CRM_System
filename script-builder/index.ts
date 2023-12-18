import { execute } from "./app";
import { widgetInit } from "./requests/widgetInit";
import { HubConnection } from "@microsoft/signalr";
import {HTTPS_PORT, prefix, SERVER_IP, SIGNALR_IP} from "./const";
import { cssStyles } from "./styles";
import { SocketService } from "./service/socket";

export let socket: SocketService ;
(async () => {
	socket = await SocketService.New();
	console.log('socket implanted')
})()

export interface GlobalState {
	hub: HubConnection | null;
	token: string | null;
	chatId: string | null;
}

export const STATE: GlobalState = {
	hub: null,
	token: null,
	chatId: null,
}

const styleSheet = new CSSStyleSheet();
console.log(cssStyles);
styleSheet.replaceSync(cssStyles);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];

async function waitForSocket(count = 5) {
	if (socket) return socket;
	if (!socket) count--;
	if (count < 0) throw new Error();

	await new Promise(res => setTimeout(() => res(true), 1000))

	return waitForSocket(count);
}
(async () => {
 await waitForSocket().catch(console.error)
	socket!.onError(async () => {
		localStorage.setItem(`${prefix}-token`, '');
		localStorage.setItem(`${prefix}-chatId`, '');
		const {token, chatId} = await widgetInit();
		STATE.token = token;
		STATE.chatId = chatId;
	})
		console.log("Connected to SignalR server");
		execute(STATE.hub!, SERVER_IP)
})()
