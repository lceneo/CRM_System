import {prefix, SERVER_IP} from "../const";

export function widgetInit() {
	const currentChatId = localStorage.getItem(`${prefix}-chatId`);
	const currentToken = localStorage.getItem(`${prefix}-token`);
	if (currentChatId && currentToken) {
		return Promise.resolve({chatId: currentChatId, token: currentToken});
	}

	return fetch(`https://${SERVER_IP}/api/Vidjets/Init`, {
		method: 'POST',
		mode: 'cors',
		headers: {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
		}
	})
		.then(r => r.json() as unknown as WidgetInitResponse)
		.then(r => {
			if (!r || !r.token) {
				throw new Error('Токен в Vidjets/Init пустой');
			}
			localStorage.setItem(`${prefix}-chatId`, r.chatId);
			localStorage.setItem(`${prefix}-token`, r.token);
			return r;
		})
}

export interface WidgetInitResponse {
	token: string | null;
	chatId: string;
}
