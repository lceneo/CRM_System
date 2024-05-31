import { computed, inject, Injectable } from '@angular/core';
import { EntityStateManager } from '../../../shared/helpers/entityStateManager';
import { IChatResponseDTO } from '../helpers/entities/ChatResponseDTO';
import { IMessageReceive } from '../helpers/entities/MessageReceive';
import { tap } from 'rxjs';
import { IUserConnectionStatus } from '../helpers/entities/UserConnectionStatus';
import { ActiveStatus } from '../helpers/enums/ActiveStatus';
import { MessageService } from './message.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChatHubService } from './chat-hub.service';
import { ChatSearchService } from 'src/app/shared/services/chat-search.service';

@Injectable({
  providedIn: 'root',
})
export class FreeChatService extends EntityStateManager<IChatResponseDTO> {
  protected override initMethod = '/Chats/Free';
  private pendingJoinIDs: string[] = [];
  private messageS = inject(MessageService);
  protected chatSocketS = inject(ChatHubService);
  private chatSearchS = inject(ChatSearchService);

  constructor() {
    super();
    this.initial();
  }
  protected override initial() {
    this.initStore();
    this.listenForNewMessages();
    this.registrateSocketHandlers();
  }

  override getEntitiesAsync() {
    const entitiesAsyncOriginalSignal = super.getEntitiesAsync();
    return computed(() =>
      entitiesAsyncOriginalSignal().sort(
        (fChat, sChat) =>
          new Date(sChat.lastMessage?.dateTime ?? 0).getTime() -
          new Date(fChat.lastMessage?.dateTime ?? 0).getTime()
      )
    );
  }

  override getEntitiesSync() {
    return super
      .getEntitiesSync()
      .sort(
        (fChat, sChat) =>
          new Date(sChat.lastMessage?.dateTime ?? 0).getTime() -
          new Date(fChat.lastMessage?.dateTime ?? 0).getTime()
      );
  }

  private listenForNewMessages() {
    const receiveFn = (msgReceive: IMessageReceive) => {
      const existingChat = this.getEntitiesSync().find(
        (chat) => chat.id === msgReceive.chatId
      );
      if (!existingChat || this.isPendingJoin(msgReceive.chatId)) {
        return;
      }
      this.updateByID(msgReceive.chatId, {
        lastMessage: {
          ...existingChat!.lastMessage,
          message: msgReceive.message,
          files: msgReceive.files,
          dateTime: msgReceive.dateTime,
          sender: { ...msgReceive.sender },
        },
        unreadMessagesCount: existingChat.unreadMessagesCount + 1,
      });
    };

    this.messageS.receivedMessages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((msgReceive) => receiveFn(msgReceive));
  }
  private registrateSocketHandlers() {
    const updateFreeChatsFn = () => {
      this.initStore();
    };

    const activeStatusFn = (statusUpdate: IUserConnectionStatus) => {
      const chatsWithUser = this.getEntitiesSync().filter(
        (freeChat) =>
          freeChat.profiles.some((p) => p.id === statusUpdate.userId) &&
          !this.isPendingJoin(freeChat.id)
      );

      chatsWithUser.forEach((chat) => {
        const profileIndex = chat.profiles.findIndex(
          (p) => p.id === statusUpdate.userId
        );
        const newProfilesArr = [...chat.profiles];
        newProfilesArr[profileIndex].isConnected =
          statusUpdate.status === ActiveStatus.Connected;
        this.updateByID(chat.id, { ...chat, profiles: newProfilesArr });
      });
    };

    const updateChatFn = (chatIds: string) => {
      this.chatSearchS
        .getById$([chatIds])
        .pipe(tap((resp) => this.upsertEntities(resp.items)))
        .subscribe();
    };

    this.chatSocketS.listenMethod('UpdateFreeChats', updateFreeChatsFn);
    this.chatSocketS.listenMethod('ActiveStatus', activeStatusFn);
    this.chatSocketS.listenMethod('ChangeChat', updateChatFn);
  }

  public isPendingJoin(chatID: string) {
    return this.pendingJoinIDs.includes(chatID);
  }
  public joinChat$(chatID: string) {
    this.pendingJoinIDs.push(chatID);
    return this.httpS.post(`/Chats/${chatID}/Join`, null).pipe(
      tap(() => {
        this.removeByID(chatID);
        this.pendingJoinIDs = this.pendingJoinIDs.filter((id) => id !== chatID);
      })
    );
  }
}
