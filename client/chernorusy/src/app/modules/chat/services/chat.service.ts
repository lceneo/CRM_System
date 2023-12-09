import {computed, Injectable, OnDestroy, signal} from '@angular/core';
import {IChatResponseDTO} from "../../../shared/models/DTO/response/ChatResponseDTO";
import {EntityStateManager} from "../../../shared/helpers/entityStateManager";
import {SocketService} from "../../../shared/services/socket.service";
import {IMessageReceive} from "../../../shared/models/entities/MessageReceive";
import {IMessageSuccess} from "../../../shared/models/entities/MessageSuccess";

@Injectable({
  providedIn: 'root'
})
export class ChatService extends EntityStateManager<IChatResponseDTO> {

  protected override initMethod = '/Chats/My';
  constructor() {
    super();
    this.initStore();
  }

  public getChatByID(chatID: string) {
    return this.httpS.get<IChatResponseDTO>(`/Chats/${chatID}`);
  }

  public updateByID(chatID: string, updatedChat: Partial<IChatResponseDTO>) {
    const existingChat = this.getEntitiesSync().find(chat => chat.id === chatID);
    if (!existingChat) { return; }
    this.updateState({
      entities: [
          ...this.getEntitiesSync().filter(chat => chat.id !== existingChat.id),
          {...existingChat, ...updatedChat}]
      });
  }

}
