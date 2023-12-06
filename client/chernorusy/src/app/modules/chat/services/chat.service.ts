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
  public initting = false;
  constructor(
    private socketS: SocketService
  ) {
    super();
  }

  public initialise() {
    if (!this.initting) {
      console.log('initting')
      this.initting = true;
      this.initStore();
      this.listenSocket();
    }
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

  private listenSocket() {
    this.socketS.listenMethod('Recieve', (msg: IMessageReceive) => {
      const existingChat = this.getEntitiesSync().find(chat => chat.id === msg.chatId);
      if (existingChat) {
        this.updateByID(existingChat.id, {lastMessage: {...existingChat.lastMessage, message: msg.message, dateTime: msg.dateTime}});
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
        } else {
          this.updateByID(msg.chatId, {lastMessage: {...existingChat!.lastMessage, message: msg.text, dateTime: msg.timeStamp}});
        }
    })

    this.socketS.disconnected$
        .subscribe(() => {
          this.initting = false;
        })
  }
}
