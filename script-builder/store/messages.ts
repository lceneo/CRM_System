class MessagesStore {
	items: Message[] = [];
	pending: Message[] = [];

	private itemsChangeListeners: ((mes: Message) => any)[] = [];
	private pendingChangeListeners: ((mes: Message[]) => any)[] = [];

	setMessage(mes: Message) {
		this.items.push(mes);
		this.itemsChangeListeners.forEach(f => f(mes));
	}

	setPending(mes: Message) {
		mes.pending = true;
		this.pending.push(mes);
		this.pendingChangeListeners.forEach(f => f(this.pending));
	}

	movePending(mes: Message, updated?: Partial<Message>) {
		this.pending = this.pending.filter(m => m !== mes);
		this.pendingChangeListeners.forEach(f => f(this.pending));
		if (updated) {
			mes = {...mes, ...updated};
		}
		mes.pending = false;
		this.setMessage(mes);
	}

	onItemsAdd(f: (mes: Message) => any) {
		this.itemsChangeListeners.push(f);
	}

	onPendingChange(f: (pending: Message[]) => any) {
		this.pendingChangeListeners.push(f);
	}
}

export class Message {
	public timeStamp: Date;
	public pending = false;
	constructor(
		public content: string,
		timestamp: Date | string | number,
		public side: 'client' | 'server',
		public name?: string,
		public surName?: string,
	) {
		this.timeStamp = new Date(timestamp);
	}
}

export const messagesStore = new MessagesStore()
