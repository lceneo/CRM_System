import {Injectable} from '@angular/core';
import {IChatResponseDTO} from "../../../shared/models/DTO/response/ChatResponseDTO";
import {EntityStateManager} from "../../../shared/helpers/entityStateManager";
import {IMessageReceive} from "../../../shared/models/entities/MessageReceive";
import {IMessageSuccess} from "../../../shared/models/entities/MessageSuccess";
import {MessageMapperService} from "../../../shared/helpers/mappers/message.mapper.service";
import {MessageService} from "./message.service";
import {tap} from "rxjs";
import {FreeChatService} from "./free-chat.service";

@Injectable({
  providedIn: 'root'
})
export class MyChatService extends EntityStateManager<IChatResponseDTO> {

  protected override initMethod = '/Chats/My';

  constructor(
    private messageS: MessageService,
    private messageMapper: MessageMapperService,
    private freeChatS: FreeChatService
  ) {
    super();
  }

  protected override initial() {
    this.initStore();
    this.registrateSocketHandlers();
  }

  public getChatByID(chatID: string) {
    return this.httpS.get<IChatResponseDTO>(`/Chats/${chatID}`);
  }

  public leaveChat(chatID: string) {
    return this.httpS.post(`/Chats/${chatID}/Leave`, null)
      .pipe(
        tap(() => this.removeByID(chatID)) //удаляем из стора
      );
  }

  private registrateSocketHandlers() {
    const receiveFn = (msgReceive: IMessageReceive) => {
      const existingChat = this.getEntitiesSync().find(chat => chat.id === msgReceive.chatId);
      const notInFreeChats = !this.freeChatS.getByID(msgReceive.id) || this.freeChatS.isPendingJoin(msgReceive.chatId);

      if (!existingChat && notInFreeChats) {
        this.getChatByID(msgReceive.chatId)
          .subscribe(newChat => {
            this.upsertEntities([newChat]);
            this.sortByPredicate((fChat, sChat) =>
              new Date(sChat.lastMessage.dateTime).getTime() - new Date(fChat.lastMessage.dateTime).getTime());
          })
        return;
      }

      else if (existingChat && notInFreeChats) {
        this.updateByID(msgReceive.chatId,
          {
            lastMessage: {
              ...existingChat.lastMessage,
              message: msgReceive.message,
              dateTime: msgReceive.dateTime,
              sender: {...msgReceive.sender}
            }
          });
        this.sortByPredicate((fChat, sChat) =>
          new Date(sChat.lastMessage.dateTime).getTime() - new Date(fChat.lastMessage.dateTime).getTime());
      }
    }

    const successFn = (msgSuccess: IMessageSuccess) => {
      const msgInChat = this.messageMapper.msgSuccessToMsgInChat(msgSuccess, this.messageS.getMessageTextByRequestNumber(msgSuccess.requestNumber));
      const existingChat = this.getEntitiesSync().find(chat => chat.id === msgInChat.chatId);

      if (!existingChat) {
        this.getChatByID(msgSuccess.chatId)
          .subscribe(chat => {
            this.upsertEntities([chat]);
            this.sortByPredicate((fChat, sChat) =>
              new Date(sChat.lastMessage.dateTime).getTime() - new Date(fChat.lastMessage.dateTime).getTime());
          });
      } else {
        this.updateByID(msgInChat.chatId,
          {
            lastMessage: {
              ...existingChat.lastMessage,
              message: msgInChat.message,
              dateTime: msgInChat.dateTime,
              sender: {...msgInChat.sender}
            }
          });
        this.sortByPredicate((fChat, sChat) =>
          new Date(sChat.lastMessage.dateTime).getTime() - new Date(fChat.lastMessage.dateTime).getTime());
      }
    }

    this.socketS.listenMethod('Recieve', receiveFn);
    this.socketS.listenMethod('Success', successFn);
  }
}
