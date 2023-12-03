import {computed, Injectable, signal} from '@angular/core';
import {HttpService} from "../../../shared/services/http.service";
import {IChatResponseDTO} from "../../../shared/models/DTO/response/ChatResponseDTO";
import {IEntityState} from "../../../shared/models/states/EntityState";
import {EntityStateManager} from "../../../shared/helpers/entityStateManager";
import {SocketService} from "../../../shared/services/socket.service";
import {IMessageReceive} from "../../../shared/models/entities/MessageReceive";

@Injectable({
  providedIn: 'root'
})
export class ChatService extends EntityStateManager<IChatResponseDTO>{

  protected override initMethod = '/Chats/My';
  constructor(
    private socketS: SocketService
  ) {
    super();
    this.initStore();
    this.listenSocket();
  }

  private listenSocket() {
    this.socketS.listenMethod('Recieve', (msg: IMessageReceive) => {
      const existingChat = this.getEntitiesSync().find(chat => chat.id === msg.id);
      if (existingChat) {
        this.updateState(
          {entities: [
            ...this.getEntitiesSync().filter(chat => chat.id !== existingChat.id,
              {...existingChat, lastMessage: {...existingChat.lastMessage, message: msg.message, dateTime: msg.dateTime}})
            ]});
      } else {
        this.initStore();
      }
    });
  }
}
