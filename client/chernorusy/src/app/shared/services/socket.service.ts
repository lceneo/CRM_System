import {Injectable, isDevMode} from '@angular/core';
import {HubConnection, HubConnectionBuilder, HubConnectionState} from "@microsoft/signalr";
import {config} from "../../../main";
import {ISendMessageRequest} from "../models/DTO/request/SendMessageRequest";
import {Subject, take} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private hubConnection!: HubConnection;
  private hubUrl = isDevMode() ? 'https://request.stk8s.66bit.ru/Hubs/Chats' : `${config.protocol}://${config.apiUrl}/${config.hubUrl}`;
  public connected$ = new Subject<void>();
  public disconnected$ = new Subject<void>();
  constructor() {}

  public init() {
    if (this.isConnected() || this.hubConnection?.state === HubConnectionState.Connecting) { return; }
    this.establishConnection();
  }

  private establishConnection() {
    this.hubConnection = new HubConnectionBuilder()
        .withAutomaticReconnect()
        .withUrl(this.hubUrl, {
          withCredentials: true,
          accessTokenFactory(): string | Promise<string> {
            return localStorage.getItem('jwtToken') as string;
          }
        })
          .build();
    this.hubConnection.start()
        .then(() => {
          console.log('Соединение по сокету установлено');
          this.connected$.next();
        })
        .catch(() => console.error('Не удалось установить соединение по сокету'));
  }
  public stopConnection() {
    this.hubConnection?.stop();
    this.disconnected$.next();
  }
  public isConnected() {
    return this.hubConnection && this.hubConnection.state === HubConnectionState.Connected;
  }
  public sendMessage(methodName: string, message: ISendMessageRequest) {
    if (this.hubConnection.state === HubConnectionState.Connected) { return this.hubConnection.send(methodName, message); }
    return Promise.reject('Не удалось отправить сообщение');
  }

  public listenMethod(methodName: string, handler: (...args: any[]) => void)  {
    if (this.isConnected()) {
      this.hubConnection.on(methodName, handler);
    } else {
      this.connected$
        .pipe(
          take(1)
        ).subscribe(() => this.hubConnection.on(methodName, handler));
    }
  }

  public unsubscribeFromMethod(methodName: string, fn?: (...args: any[]) => void) {
    if (fn) { this.hubConnection.off(methodName, fn); }
    else { this.hubConnection.off(methodName); }
  }
}
