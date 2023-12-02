import {Injectable, signal} from '@angular/core';
import {SocketService} from "../../../shared/services/socket.service";

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private socketS: SocketService
  ) { }

  public getMessages$() {
    return signal<IMessage[]>([
      { author: 'Nikita', text: 'First Message', timestamp: new Date().toISOString()},
      { author: 'Egor', text: 'Second Message', timestamp: new Date().toISOString()},
    ])
  }

  public sendMessage(userOrChatID: string, messageText: string, requestNumber: number) {
    return this.socketS.sendMessage('Send', {
      "recipientId": userOrChatID,
      "message": messageText,
      "requestNumber": requestNumber
    });
  }
}

export interface IMessage{
  author: string;
  text: string;
  timestamp: string;
}
