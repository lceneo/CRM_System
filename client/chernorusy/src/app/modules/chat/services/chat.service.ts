import {computed, Injectable, signal} from '@angular/core';
import {HttpService} from "../../../shared/services/http.service";
import {IChatResponseDTO} from "../../../shared/models/DTO/response/ChatResponseDTO";
import {IEntityState} from "../../../shared/models/states/EntityState";
import {EntityStateManager} from "../../../shared/helpers/entityStateManager";
import {SocketService} from "../../../shared/services/socket.service";
import {IMessageReceive} from "../../../shared/models/entities/MessageReceive";
import {IMessageSuccess} from "../../../shared/models/entities/MessageSuccess";

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

  public getChatByID(chatID: string) {
    return this.httpS.get<IChatResponseDTO>(`/Chats/${chatID}`);
  }

  private listenSocket() {
    this.socketS.listenMethod('Recieve', (msg: IMessageReceive) => {
      const existingChat = this.getEntitiesSync().find(chat => chat.id === msg.chatId);
      if (existingChat) {
        this.updateState(
          {entities: [
            ...this.getEntitiesSync().filter(chat => chat.id !== existingChat.id),
              {...existingChat, lastMessage: {...existingChat.lastMessage, message: msg.message, dateTime: msg.dateTime}}
            ]});
      } else {
        this.getChatByID(msg.chatId)
          .subscribe(chat => this.upsertEntities([chat]));
      }
    });
    this.socketS.listenMethod('Success', (msg: IMessageSuccess) => {
      const existingChat = this.getEntitiesSync().find(chat => chat.id === msg.chatId);
      if (!existingChat) {
        this.getChatByID(msg.chatId)
          .subscribe(chat => this.upsertEntities([chat]));
      }
    })
  }
}
