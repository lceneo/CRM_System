import {Injectable} from '@angular/core';
import {HttpTransportType, HubConnection, HubConnectionBuilder, HubConnectionState} from "@microsoft/signalr";
import {config} from "../../../main";
import {ISendMessageRequest} from "../models/DTO/request/SendMessageRequest";
import {Subject, take} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private hubConnection!: HubConnection;
  private url = config.apiUrl;
  private hubUrl = config.hubUrl;
  private protocol = config.protocol;
  private connected$ = new Subject<void>();
  constructor() {}

  public init() {
    this.establishConnection();
  }

  private establishConnection() {
    this.hubConnection = new HubConnectionBuilder()
        .withAutomaticReconnect()
        .withUrl(`https://localhost:7156/${this.hubUrl}`, {
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
  }
  public isConnected() {
    return this.hubConnection && (this.hubConnection.state === HubConnectionState.Connected || this.hubConnection.state === HubConnectionState.Connecting);
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
}
