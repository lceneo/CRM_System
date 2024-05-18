import {computed, inject, Injectable} from '@angular/core';
import {IChatResponseDTO} from "../helpers/entities/ChatResponseDTO";
import {EntityStateManager} from "../../../shared/helpers/entityStateManager";
import {IMessageReceive} from "../helpers/entities/MessageReceive";
import {MessageService} from "./message.service";
import {tap} from "rxjs";
import {FreeChatService} from "./free-chat.service";
import {ChatStatus} from "../helpers/enums/ChatStatus";
import {IUserConnectionStatus} from "../helpers/entities/UserConnectionStatus";
import {ActiveStatus} from "../helpers/enums/ActiveStatus";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {IMessageInChat} from "../helpers/entities/MessageInChat";
import {ChatHubService} from "./chat-hub.service";

@Injectable({
  providedIn: 'root'
})
export class MyChatService extends EntityStateManager<IChatResponseDTO> {

  protected override initMethod = '/Chats/My';
  private allChats = this.getEntitiesAsync();
  private allChatsSorted = computed(() => this.allChats()
    .sort((fChat, sChat) =>
      new Date(sChat.lastMessage?.dateTime ?? 0).getTime() - new Date(fChat.lastMessage?.dateTime ?? 0).getTime()));

  protected chatSocketS = inject(ChatHubService);
  constructor(
    private messageS: MessageService,
    private freeChatS: FreeChatService
  ) {
    super();
    this.initial();
  }


  protected override initial() {
    this.initStore();
    this.listenForNewMessages();
    this.registrateSocketHandlers();
  }

  public getActiveChatsAsync() {
    return computed(() => {
      return this.allChatsSorted()
        .filter(chat => chat.status === ChatStatus.Active)
    });
  }

  public getBlockedChatsAsync() {
    return computed(() => {
      return this.allChatsSorted()
        .filter(chat => chat.status === ChatStatus.Blocked)
    });
  }

  public getArchiveChatsAsync() {
    return computed(() => {
      return this.allChatsSorted()
        .filter(chat => chat.status === ChatStatus.Archive)
    });
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

  public changeChatStatus(chatID: string, chatStatus: ChatStatus) {
    return this.httpS.post(`/Chats/${chatID}/Status`, {status: chatStatus})
      .pipe(
        tap(() => this.updateByID(chatID, {status: chatStatus}))
      );
  }

  private listenForNewMessages() {
    const receiveFn = (msgReceive: IMessageReceive) => {
      const existingChat = this.getEntitiesSync().find(chat => chat.id === msgReceive.chatId);
      const notInFreeChats = !this.freeChatS.getByID(msgReceive.chatId) || this.freeChatS.isPendingJoin(msgReceive.chatId);

      if (!existingChat && notInFreeChats) {
        this.getChatByID(msgReceive.chatId)
          .subscribe(newChat => {
            this.upsertEntities([newChat]);
          });
      }

      else if (existingChat && notInFreeChats) {
        this.updateByID(msgReceive.chatId,
          {
            lastMessage: {
              ...existingChat.lastMessage,
              message: msgReceive.message,
              files: msgReceive.files,
              dateTime: msgReceive.dateTime,
              sender: {...msgReceive.sender}
            },
            unreadMessagesCount: existingChat.unreadMessagesCount + 1
          });
      }
    }

    const successFn = (msgSuccess: IMessageInChat) => {
      const existingChat = this.getEntitiesSync().find(chat => chat.id === msgSuccess.chatId);

      if (!existingChat) {
        this.getChatByID(msgSuccess.chatId)
          .subscribe(chat => {
            this.upsertEntities([chat]);
          });
      } else {
        this.updateByID(msgSuccess.chatId,
          {
            lastMessage: {
              ...existingChat.lastMessage,
              message: msgSuccess.message,
              files: msgSuccess.files,
              dateTime: msgSuccess.dateTime,
              sender: {...msgSuccess.sender}
            }
          });
      }
    }

    this.messageS.receivedMessages$
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(msgReceive => receiveFn(msgReceive));

    this.messageS.successMessages$
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(msgSuccess => successFn(msgSuccess));
  }

  private registrateSocketHandlers() {
    const activeStatusFn = (statusUpdate: IUserConnectionStatus) => {
      const chatsWithUser = this.getEntitiesSync()
        .filter(freeChat => freeChat.profiles.some(p => p.id === statusUpdate.userId));

      chatsWithUser.forEach(chat => {
        const profileIndex = chat.profiles.findIndex(p => p.id === statusUpdate.userId);
        const newProfilesArr = [...chat.profiles];
        newProfilesArr[profileIndex].isConnected = statusUpdate.status === ActiveStatus.Connected;
        this.updateByID(chat.id, {...chat,
          profiles: newProfilesArr
        });
      })
    }
    this.chatSocketS.listenMethod('ActiveStatus', activeStatusFn);
  }
}
