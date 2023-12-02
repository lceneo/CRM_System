import {Injectable, signal} from '@angular/core';
import {SocketService} from "../../../shared/services/socket.service";
import {HttpService} from "../../../shared/services/http.service";
import {IMessageInChat} from "../../../shared/models/entities/MessageInChat";
import {IMessageInChatResponseDTO} from "../../../shared/models/DTO/request/MessageInChatResponseDTO";

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private socketS: SocketService,
    private httpS: HttpService
  ) { }

  public getMessages$(chatID: string) {
    return this.httpS.get<IMessageInChatResponseDTO>(`/Chats/${chatID}/Messages`);
  }

  public sendMessage(userOrChatID: string, messageText: string, requestNumber: number) {
    return this.socketS.sendMessage('Send', {
      "recipientId": userOrChatID,
      "message": messageText,
      "requestNumber": requestNumber
    });
  }
}
