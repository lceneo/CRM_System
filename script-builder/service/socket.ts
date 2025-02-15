import {
  HttpTransportType,
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { HTTPS_PORT, prefix, SERVER_IP, SIGNALR_IP } from "../const";
import { widgetInit } from "../requests/widgetInit";
import { STATE } from "../index";
import { Message, messagesStore } from "../store/messages";
import { getIsCustomizing } from "../customization";
import { LocalStorage } from "./localStorage";
import { events } from "./events";

export class SocketService {
  private hub!: HubConnection;
  private store = messagesStore;

  private successListeners: SuccessListener[] = [];
  private messageListeners: MessageListener[] = [];
  private errorListeners: Function[] = [];
  private activeStatusListeners: ((connected: boolean) => void)[] = [];
  private _waitingForMessageSuccess = 0;
  private ourId = "";
  private readonly defaultMessage = {
    recipientId: STATE.chatId,
    requestNumber: this.requestNumber,
    message: null,
    fileKeys: [],
  };

  get waitingForMessageSuccess() {
    return this._waitingForMessageSuccess;
  }

  private _requestNumber = 0;
  get requestNumber() {
    return this._requestNumber++;
  }

  constructor({ hub }: SocketInitParams) {
    if (getIsCustomizing()) {
      return;
    }
    this.hub = hub!;
    if (!this.hub) {
      this.hub = this.getHub(
        `https://${SERVER_IP}:${HTTPS_PORT}/${SIGNALR_IP}`
      );
    }

    this.hub.on("Success", (data) => {
      this.successListeners = this.successListeners.filter((f) => {
        return f(data.requestNumber, new Date(data.timeStamp));
      });
    });

    this.hub.on("Recieve", (data) => {
      const msg = data.message?.toString();
      console.log("datamessage", msg?.endsWith("вошел в чат"), data);
      console.log(
        "dataMessage",
        data.message,
        data.message === "Чат архивирован менеджером"
      );

      if (!data.sender && msg === "Чат архивирован менеджером") {
        events.trigger("archive");
        return;
      }

      if (!data.sender && msg?.endsWith("вышел из чата")) {
        messagesStore.setMessage(
          new Message(data.message, new Date(data.dateTime), "join")
        );
        return;
      }

      if (!data.sender && msg?.endsWith("вошел в чат")) {
        messagesStore.setMessage(
          new Message(data.message, new Date(data.dateTime), "join")
        );
        return;
      }
      if (msg) {
        messagesStore.setMessage(
          new Message(
            data.message,
            new Date(data.dateTime),
            "server",
            data.sender
          )
        );
      }

      data.files?.map((file: any) => {
        const msg = new Message(
          file.fileName,
          new Date(data.dateTime),
          "server",
          data.sender,
          file.fileKey
        );
        messagesStore.setMessage(msg);
      });
      this.messageListeners = this.messageListeners.filter((f) =>
        f(data.message, new Date(data.dateTime))
      );
    });

    this.hub.on("Error", () => {
      this.errorListeners.forEach((f) => f());
    });

    this.hub.on("ActiveStatus", (data) => {
      this.activeStatusListeners.forEach((f) => f(data.status === 0));
    });

    this.hub.on("Check", (data) => {
      console.log("data", data);
      LocalStorage.manager = data.value.checker;
      STATE.manager = data.value.checker;
    });
  }

  static async New(): Promise<SocketService | null> {
    if (getIsCustomizing()) {
      return Promise.resolve(null);
    }
    let socket: SocketService = null!;
    return widgetInit()
      .then((resp) => {
        STATE.chatId = resp.chatId;
        STATE.token = resp.token;
      })
      .catch((err) => {
        console.log(err);
        console.error("Не удалось выполнить Vidjet/Init");
      })
      .then(
        () =>
          (socket = new SocketService({
            chatId: STATE.chatId!,
            token: STATE.token!,
          }))
      )
      .then(() => socket.hub.start())
      .then(() => socket)
      .catch((err) => {
        if (err.toString().includes("Status code '401'")) {
          localStorage.removeItem(`${prefix}-chatId`);
          localStorage.removeItem(`${prefix}-token`);
          localStorage.removeItem(`${prefix}-messages`);
          localStorage.removeItem(`${prefix}-manager`);
          localStorage.removeItem(`${prefix}-client`);

          return new Promise<SocketService | null>((res) =>
            setTimeout(() => res(this.New()), 5000)
          );
        }
        return null;
      });
  }

  onMessage(func: MessageListener) {
    this.messageListeners.push(func);
  }

  onError(func: Function) {
    this.errorListeners.push(func);
  }

  onActiveStatus(func: (connected: boolean) => any) {
    this.activeStatusListeners.push(func);
  }

  sendMessage(message: string): Promise<Date> {
    return new Promise((res) => {
      this._waitingForMessageSuccess++;
      const awaiter: SuccessListener = (requestNum, timestamp) => {
        this._waitingForMessageSuccess--;
        res(timestamp);
        return false;
      };
      this.successListeners.push(awaiter);
      const messageObj = {
        ...this.defaultMessage,
        recipientId: STATE.chatId,
        message,
        requestNumber: this.requestNumber,
      };
      this.hub.send("Send", messageObj);
    });
  }

  sendFile(fileKeys: string[]): Promise<Date> {
    if (!STATE.chatId) return Promise.reject("no chat id");
    if (this.hub?.state !== HubConnectionState.Connected)
      return this.sendFile(fileKeys);
    return new Promise((res) => {
      const awaiter: SuccessListener = (requestNum, timestamp) => {
        this._waitingForMessageSuccess--;
        res(timestamp);
        return false;
      };
      this.successListeners.push(awaiter);
      const messageObj = {
        ...this.defaultMessage,
        recipientId: STATE.chatId,
        fileKeys: fileKeys,
        requestNumber: this.requestNumber,
      };
      this.hub.send("Send", messageObj);
    });
  }

  sendRating(score: number, comment: string | null = ""): Promise<Date> {
    const chatId = STATE.chatId || LocalStorage.chatId;
    const token = STATE.token || LocalStorage.token;

    if (!chatId) return Promise.reject("no chat id");
    if (!token) return Promise.reject("no token");
    if (this.hub?.state !== HubConnectionState.Connected)
      return this.sendRating(score, comment);

    return new Promise((res) => {
      const awaiter: SuccessListener = (requestNum, timestamp) => {
        this._waitingForMessageSuccess--;
        res(timestamp);
        return false;
      };
      this.successListeners.push(awaiter);
      const body: RatingRequestBody & { requestNum: number } = {
        score,
        comment: comment ?? "",
        chatId: chatId!,
        requestNum: this.requestNumber,
      };
      this.hub?.send("Rate", body);
    });
  }

  sendClient(client: CreateClientBody): Promise<Date> {
    const chatId = STATE.chatId || LocalStorage.chatId;
    const token = STATE.token || LocalStorage.token;

    if (!chatId) return Promise.reject("no chat id");
    if (!token) return Promise.reject("no token");
    if (this.hub?.state !== HubConnectionState.Connected)
      return this.sendClient(client);

    return new Promise((res) => {
      const awaiter: SuccessListener = (requestNum, timestamp) => {
        this._waitingForMessageSuccess--;
        res(timestamp);
        return false;
      };
      this.successListeners.push(awaiter);
      const body: CreateClientBody & { requestNum: number; chatId: string } = {
        requestNum: this.requestNumber,
        chatId,
        ...client,
      };
      this.hub?.send("CreateClient", body);
    });
  }

  private getHub(url: string): HubConnection {
    const hub = new HubConnectionBuilder()
      .withUrl(url, {
        transport: HttpTransportType.WebSockets,
        withCredentials: true,
        accessTokenFactory(): string | Promise<string> {
          return STATE.token!;
        },
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Debug)
      .build();

    hub.onreconnecting(() =>
      console.info("Trying to reconnect to SignalR server")
    );
    hub.onreconnected(() =>
      console.info("Successfully reconnected to SignalR server")
    );
    hub.onclose(() => console.info("SignalR connection closed"));
    hub.keepAliveIntervalInMilliseconds = 2500;
    hub.on("Error", console.error);
    window.addEventListener("beforeunload", () => {
      if (hub.state !== "Disconnected" && hub.state !== "Disconnecting") {
        hub.stop();
      }
    });

    return hub;
  }
}

type SocketInitParams = {
  chatId: string;
  token: string;
  hub?: HubConnection;
};

type SuccessListener = (
  requestNum: number,
  timeStamp: Date
) => undefined | void | false | true;
type MessageListener = (
  message: string,
  timeStamp: Date
) => undefined | void | false | true;

interface RatingRequestBody {
  chatId: string;
  comment: string;
  score: number;
}

interface CreateClientBody {
  surname?: string | null;
  name?: string | null;
  patronymic?: string | null;
  email?: string | null;
  phone?: string | null;
  description?: string | null;
}
