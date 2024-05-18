import {LocalStorage} from "../service/localStorage";
import {SERVER_IP} from "../const";
import {HubConnection, HubConnectionState} from "@microsoft/signalr";

export function sendRating(hub: HubConnection | null, score: number, comment: string | null = '') {
	/*const body: RatingRequestBody = {
		score,
		comment: comment ?? '',
		chatId: LocalStorage.chatId!,
		managerId: LocalStorage.manager?.id!,
	}
	if (hub?.state !== HubConnectionState.Connected || !body.chatId || !body.managerId) return Promise.reject();
	return hub?.send('Rating', body);*/
	/*return fetch(`https://${SERVER_IP}/api/Rating`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			Authorization: `Bearer ${LocalStorage.token}`
		}
	})*/
}

