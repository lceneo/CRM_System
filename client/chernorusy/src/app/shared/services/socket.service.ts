import { Injectable } from '@angular/core';
import {HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import {config} from "../../../main";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private hubConnection!: HubConnection;
  private url = config.apiUrl;
  private hubUrl = config.hubUrl;
  private protocol = config.protocol;
  constructor() {
    this.establishConnection();
  }

  private establishConnection() {
    this.hubConnection = new HubConnectionBuilder()
        .withAutomaticReconnect()
        .withUrl(`${this.protocol}://${this.url}/${this.hubUrl}`)
        .build();
    this.hubConnection.start()
        .then(() => console.log('Соединение по сокету установлено'))
        .catch(() => console.error('Не удалось установить соединение по сокету'));
  }
}
