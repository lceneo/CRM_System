import {inject, Injectable} from '@angular/core';
import {EntityStateManager} from "../../../shared/helpers/entityStateManager";
import {IChatResponseDTO} from "../../../shared/models/DTO/response/ChatResponseDTO";
import {IMessageReceive} from "../../../shared/models/entities/MessageReceive";
import {tap} from "rxjs";
import {IUserConnectionStatus} from "../../../shared/models/entities/UserConnectionStatus";
import {ActiveStatus} from "../../../shared/models/enums/ActiveStatus";
import {MessageService} from "./message.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: 'root'
})
export class FreeChatService extends EntityStateManager<IChatResponseDTO> {

  protected override initMethod = '/Chats/Free';
  private pendingJoinIDs: string[] = [];
  private sortFn = () => this.sortByPredicate((fChat, sChat) =>
    new Date(sChat.lastMessage?.dateTime ?? 0).getTime() - new Date(fChat.lastMessage?.dateTime ?? 0).getTime());
  private messageS = inject(MessageService);
  protected override initial() {
    this.initStore(this.sortFn);
    this.listenForNewMessages();
    this.registrateSocketHandlers();
  }

  private listenForNewMessages() {
    const receiveFn = (msgReceive: IMessageReceive) => {
      const existingChat = this.getEntitiesSync().find(chat => chat.id === msgReceive.chatId);
      if (!existingChat || this.isPendingJoin(msgReceive.chatId)) { return; }
      this.updateByID(msgReceive.chatId,
        {
          lastMessage: {
            ...existingChat!.lastMessage,
            message: msgReceive.message,
            files: msgReceive.files,
            dateTime: msgReceive.dateTime,
            sender: {...msgReceive.sender}
          },
          unreadMessagesCount: existingChat.unreadMessagesCount + 1
        });
    }

    this.messageS.receivedMessages$
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(msgReceive => receiveFn(msgReceive));
  }
  private registrateSocketHandlers() {
    const updateFreeChatsFn = () => {
      this.initStore(this.sortFn);
    }


    const activeStatusFn = (statusUpdate: IUserConnectionStatus) => {
      const chatsWithUser = this.getEntitiesSync()
        .filter(freeChat => freeChat.profiles.some(p => p.id === statusUpdate.userId) && !this.isPendingJoin(freeChat.id));

      chatsWithUser.forEach(chat => {
        const profileIndex = chat.profiles.findIndex(p => p.id === statusUpdate.userId);
        const newProfilesArr = [...chat.profiles];
        newProfilesArr[profileIndex].isConnected = statusUpdate.status === ActiveStatus.Connected;
        this.updateByID(chat.id, {...chat,
          profiles: newProfilesArr
        });
      })
    }

    this.socketS.listenMethod('UpdateFreeChats', updateFreeChatsFn);
    this.socketS.listenMethod('ActiveStatus', activeStatusFn);
  }

  public isPendingJoin(chatID: string) {
    return this.pendingJoinIDs.includes(chatID);
  }
  public joinChat$(chatID: string) {
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
