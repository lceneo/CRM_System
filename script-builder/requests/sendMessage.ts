import { HubConnection, HubConnectionState } from "@microsoft/signalr";

export async function sendMessage(hub: HubConnection | null, chatId: string | null, message: string) {
	if (hub?.state !== HubConnectionState.Connected || !chatId) return Promise.reject();
	return hub?.send('Send', { recipientId: chatId, message, requestNumber: 0 });
}
