import {Injectable} from '@angular/core';
import {HubConnection, HubConnectionBuilder, HubConnectionState} from "@microsoft/signalr";
import {config} from "../../../main";
import {ISendMessageRequest} from "../models/DTO/request/SendMessageRequest";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private hubConnection!: HubConnection;
  private url = config.apiUrl;
  private hubUrl = config.hubUrl;
  private protocol = config.protocol;
  constructor() {}

  public init() {
    this.establishConnection();
  }

  private establishConnection() {
    this.hubConnection = new HubConnectionBuilder()
        .withAutomaticReconnect()
        .withUrl(`https://localhost:7156/${this.hubUrl}`)
        .build();
    this.hubConnection.start()
        .then(() => {console.log('Соединение по сокету установлено'); this.sendMessage('Send', {
          "recipientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "message": "privet",
          "requestNumber": 12
        })})
        .catch(() => console.error('Не удалось установить соединение по сокету'));
  }
  public stopConnection() {
    this.hubConnection?.stop();
  }
  public isConnected() {
    return this.hubConnection && (this.hubConnection.state === HubConnectionState.Connected || this.hubConnection.state === HubConnectionState.Connecting);
  }
  public sendMessage(methodName: string, message: ISendMessageRequest) {
    if (this.hubConnection.state === HubConnectionState.Connected) { this.hubConnection.send(methodName, message); }
  }
}
