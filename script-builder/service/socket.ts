import { HttpTransportType, HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { HTTPS_PORT, SERVER_IP, SIGNALR_IP } from "../const";
import { widgetInit } from "../requests/widgetInit";
import { STATE } from "../index";
import { Message, messagesStore } from "../store/messages";
import {getIsCustomizing} from "../customization";

export class SocketService {
	private hub!: HubConnection;
	private store = messagesStore;

	private successListeners: SuccessListener[] = [];
	private messageListeners: MessageListener[] = [];
	private errorListeners: Function[] = [];
	private activeStatusListeners: ((connected: boolean) => void)[] = [];
	private _waitingForMessageSuccess = 0;
	private ourId = '';
	private readonly defaultMessage = {
		recipientId: STATE.chatId,
		requestNumber: this.requestNumber,
		message: null,
		fileKeys: [],
	}

	get waitingForMessageSuccess() {return this._waitingForMessageSuccess}
	private _requestNumber = 0;
	get requestNumber() {return this._requestNumber++;}

	constructor({ hub }: SocketInitParams) {
		if (getIsCustomizing()) {
			return
		}
		this.hub = hub!;
		if (!this.hub) {
			this.hub = this.getHub(`https://${SERVER_IP}:${HTTPS_PORT}/${SIGNALR_IP}`);
		}

		this.hub.on('Success', (data) => {
			this.successListeners = this.successListeners.filter(f => {
				return f(data.requestNumber, new Date(data.timeStamp))
			})
		})

		this.hub.on('Recieve', (data) => {
			const msg: string = data.message.toString();
			if (msg.endsWith('вошел в чат')) {
				messagesStore.setMessage(new Message(data.message, new Date(), 'join'))
				return;
			}
			messagesStore.setMessage(new Message(data.message, new Date(data.dateTime), 'server', data.sender.name, data.sender.surname))
			this.messageListeners = this.messageListeners.filter(f => f(data.message, new Date(data.dateTime)))
		})

		this.hub.on('Error', () => {
			this.errorListeners.forEach(f => f());
		})

		this.hub.on('ActiveStatus', (data) => {
			if (!this.ourId) {
				this.ourId = data.userId;
				return;
			}
			if (data.userId === this.ourId) {
				return;
			}
			this.activeStatusListeners.forEach(f => f(data.status === 0))
		})
	}

	static async New(): Promise<SocketService | null> {
		if (getIsCustomizing()) {
			return Promise.resolve(null)
		}
		let socket: SocketService = null!
		return widgetInit()
			.then(resp => {
				STATE.chatId = resp.chatId;
				STATE.token = resp.token;
			})
			.catch(err => {
				console.log(err);
				console.error('Не удалось выполнить Vidjet/Init')
			})
			.then(() => socket = new SocketService({chatId: STATE.chatId!, token: STATE.token!}))
			.then(() => socket.hub.start())
			.then(() => socket);
	}

	onMessage(func: MessageListener) {
		this.messageListeners.push(func);
	}

	onError(func: Function) {
		this.errorListeners.push(func);
	}

	onActiveStatus(func: (connected: boolean) => any) {
		this.activeStatusListeners.push(func)
	}

	sendMessage(message: string): Promise<Date> {
		if (!STATE.chatId) return Promise.reject('no chat id');
		if (this.hub?.state !== HubConnectionState.Connected) return this.sendMessage(message);
		return new Promise((res) => {
			this._waitingForMessageSuccess++;
			const awaiter: SuccessListener = (requestNum, timestamp) => {
					this._waitingForMessageSuccess--;
					res(timestamp);
					return false;
				}
			this.successListeners.push(awaiter);
			const messageObj = {
				...this.defaultMessage,
				recipientId: STATE.chatId,
				message,
				requestNumber: this.requestNumber,
			}
			this.hub.send('Send', messageObj);
		})
	}

	private getHub(url: string): HubConnection {
		const hub = new HubConnectionBuilder()
			.withUrl(url, {
				skipNegotiation: true,
				transport: HttpTransportType.WebSockets,
				withCredentials: true,
				accessTokenFactory(): string | Promise<string> {
					return STATE.token!;
				}
			})
			.withAutomaticReconnect()
			.configureLogging(LogLevel.Debug)
			.build();

		hub.onreconnecting(() => console.info('Trying to reconnect to SignalR server'));
		hub.onreconnected(() => console.info('Successfully reconnected to SignalR server'));
		hub.onclose(() => console.info('SignalR connection closed'));

		hub.on('Error', console.error);

		window.addEventListener('beforeunload', () => {
			if (hub.state !== 'Disconnected' && hub.state !== 'Disconnecting') {
				hub.stop()
			}
		})

		return hub;
	}
}

type SocketInitParams = {
	chatId: string, token: string, hub?: HubConnection
}

type SuccessListener = (requestNum: number, timeStamp: Date) => undefined | void | false | true
type MessageListener = (message: string, timeStamp: Date) => undefined | void | false | true
