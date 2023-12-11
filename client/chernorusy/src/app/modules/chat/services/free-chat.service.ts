import { Injectable } from '@angular/core';
import {EntityStateManager} from "../../../shared/helpers/entityStateManager";
import {IChatResponseDTO} from "../../../shared/models/DTO/response/ChatResponseDTO";
import {IMessageReceive} from "../../../shared/models/entities/MessageReceive";

@Injectable({
  providedIn: 'root'
})
export class FreeChatService extends EntityStateManager<IChatResponseDTO> {

  protected override initMethod = '/Chats/Free';
  protected override initial() {
    this.initStore();
    this.registrateSocketHandlers();
  }

  private registrateSocketHandlers() {
    const updateFreeChatsFn = () => {
      this.initStore();
    }

    const receiveFn = (msgReceive: IMessageReceive) => {
      const existingChat = this.getEntitiesSync().find(chat => chat.id === msgReceive.chatId);
      this.updateByID(msgReceive.chatId,
          {
            lastMessage: {
              ...existingChat!.lastMessage,
              message: msgReceive.message,
              dateTime: msgReceive.dateTime,
              sender: {...msgReceive.sender}
            }
          });
    }
    this.socketS.listenMethod('UpdateFreeChats', updateFreeChatsFn);
    this.socketS.listenMethod('Recieve', receiveFn);

  }

  public joinChat(chatID: string) {
    return this.httpS.post(`/Chats/${chatID}/Join`, null);
  }
}
