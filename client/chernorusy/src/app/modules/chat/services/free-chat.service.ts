import { Injectable } from '@angular/core';
import {EntityStateManager} from "../../../shared/helpers/entityStateManager";
import {IChatResponseDTO} from "../../../shared/models/DTO/response/ChatResponseDTO";
import {IMessageReceive} from "../../../shared/models/entities/MessageReceive";
import {tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FreeChatService extends EntityStateManager<IChatResponseDTO> {

  protected override initMethod = '/Chats/Free';
  private pendingJoinIDs: string[] = [];
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
      if (!existingChat || this.isPendingJoin(msgReceive.chatId)) { return; }
      this.updateByID(msgReceive.chatId,
          {
            lastMessage: {
              ...existingChat!.lastMessage,
              message: msgReceive.message,
              fileUrl: msgReceive.fileUrl,
              dateTime: msgReceive.dateTime,
              sender: {...msgReceive.sender}
            }
          });
    }
    this.socketS.listenMethod('UpdateFreeChats', updateFreeChatsFn);
    this.socketS.listenMethod('Recieve', receiveFn);

  }

  public isPendingJoin(chatID: string) {
    return this.pendingJoinIDs.includes(chatID);
  }
  public joinChat(chatID: string) {
    this.pendingJoinIDs.push(chatID);
    return this.httpS.post(`/Chats/${chatID}/Join`, null)
      .pipe(
        tap(() => {
          this.removeByID(chatID);
          this.pendingJoinIDs = this.pendingJoinIDs.filter(id => id !== chatID);
        })
      );
  }
}
