export class Events {
	listeners: Record<string, any[]> = {};

	listen(type: string, handler: (...v: any[]) => any) {
		if (!this.listeners[type]) {
			this.listeners[type] = [];
		}
		this.listeners[type].push(handler);
	}

	trigger(type: string, ...params: any[]) {
		if (!this.listeners[type]) {
			return;
		}
		this.listeners[type].forEach(handler => handler(...params));
	}
}

export const events = new Events();
