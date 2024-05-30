import { ChatStatus } from './../helpers/enums/ChatStatus';
import { ChatSearchService } from 'src/app/shared/services/chat-search.service';
import { computed, inject, Injectable, OnDestroy } from '@angular/core';
import { IChatResponseDTO } from '../helpers/entities/ChatResponseDTO';
import { EntityStateManager } from '../../../shared/helpers/entityStateManager';
import { IMessageReceive } from '../helpers/entities/MessageReceive';
import { MessageService } from './message.service';
import {
  BehaviorSubject,
  fromEvent,
  map,
  merge,
  Observable,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { FreeChatService } from './free-chat.service';
import { IUserConnectionStatus } from '../helpers/entities/UserConnectionStatus';
import { ActiveStatus } from '../helpers/enums/ActiveStatus';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IMessageInChat } from '../helpers/entities/MessageInChat';
import { ChatHubService } from './chat-hub.service';
import { Client } from 'src/app/shared/services/client.service';

@Injectable({
  providedIn: 'root',
})
export class MyChatService
  extends EntityStateManager<IChatResponseDTO>
  implements OnDestroy
{
  protected override initMethod = '/Chats/My';
  private allChats = this.getEntitiesAsync();
  private allChatsSorted = computed(() =>
    this.allChats().sort(
      (fChat, sChat) =>
        new Date(sChat.lastMessage?.dateTime ?? 0).getTime() -
        new Date(fChat.lastMessage?.dateTime ?? 0).getTime()
    )
  );

  protected chatSocketS = inject(ChatHubService);
  private chatSearchS = inject(ChatSearchService);
  private readonly localStorageSendInfoKey = 'user-send-info-saved';
  constructor(
    private messageS: MessageService,
    private freeChatS: FreeChatService
  ) {
    super();
    this.initial();
    const fiveDaysMS = 1000 * 60 * 60 * 24 * 5;
    const savedSendInfo = JSON.parse(
      localStorage.getItem(this.localStorageSendInfoKey) ?? '{}'
    );
    Object.keys(savedSendInfo)
      .filter(
        (chatId) =>
          Date.now() - savedSendInfo[chatId].timestampSent > fiveDaysMS
      )
      .forEach((chatId) => delete savedSendInfo[chatId]);
    Object.keys(savedSendInfo).forEach((chatId) => {
      this.userSendInfo$.value[chatId] = savedSendInfo[chatId];
    });
    this.userSendInfo$.next(this.userSendInfo$.value);

    merge([fromEvent(window, 'beforeUnload'), this.destroy$]).subscribe(() => {
      Object.keys(this.userSendInfo$.value)
        .filter(
          (chatId) =>
            Date.now() - savedSendInfo[chatId].timestampSent > fiveDaysMS
        )
        .forEach((chatId) => delete this.userSendInfo$.value[chatId]);
      localStorage.setItem(
        this.localStorageSendInfoKey,
        JSON.stringify(this.userSendInfo$.value)
      );
    });
  }

  private destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private userSendInfo$ = new BehaviorSubject<{
    [chatId: string]: SetClientResponse & { timestampSent: number };
  }>({});

  public getUserSendInfo(
    chatId: string
  ): (typeof this.userSendInfo$.value)[string] | null {
    return this.userSendInfo$.value[chatId] ?? null;
  }

  public getUserSendInfo$(
    chatId: string
  ): Observable<(typeof this.userSendInfo$.value)[string] | null> {
    return this.userSendInfo$.pipe(
      map((userSendInfo) => userSendInfo[chatId] ?? null)
    );
  }

  protected override initial() {
    this.initStore();
    this.listenForNewMessages();
    this.registrateSocketHandlers();
  }

  public getActiveChatsAsync() {
    return computed(() => {
      return this.allChatsSorted().filter(
        (chat) => chat.status === ChatStatus.Active
      );
    });
  }

  public getBlockedChatsAsync() {
    return computed(() => {
      return this.allChatsSorted().filter(
        (chat) => chat.status === ChatStatus.Blocked
      );
    });
  }

  public getArchiveChatsAsync() {
    return computed(() => {
      return this.allChatsSorted().filter(
        (chat) => chat.status === ChatStatus.Archive
      );
    });
  }

  public updateChatById$(newData: {
    chatId: string;
    clientId?: string | null;
    status?: ChatStatus | null;
  }): Observable<{
    id: string;
    isCreated: boolean;
  }> {
    return this.httpS.patch('/Chats', newData).pipe(
      switchMap((resp: any) => {
        const { id, isCreated } = resp as unknown as {
          id: string;
          isCreated: boolean;
        };
        return this.updateChatFn$([id]).pipe(map(() => ({ id, isCreated })));
      })
    );
  }

  public setChatClient$(chatId: string, clientOrClientId: Client | string) {
    let clientId: string = clientOrClientId as string;
    if (typeof clientOrClientId === 'object') {
      clientId = clientOrClientId.id;
    }
    return this.updateChatById$({ chatId, clientId });
  }

  public getChatByID(chatID: string) {
    return this.httpS.get<IChatResponseDTO>(`/Chats/${chatID}`);
  }

  public leaveChat(chatID: string) {
    return this.httpS.post(`/Chats/${chatID}/Leave`, null).pipe(
      tap(() => this.removeByID(chatID)) //удаляем из стора
    );
  }

  public changeChatStatus(chatID: string, chatStatus: ChatStatus) {
    return this.httpS
      .post(`/Chats/${chatID}/Status`, { status: chatStatus })
      .pipe(tap(() => this.updateByID(chatID, { status: chatStatus })));
  }

  private listenForNewMessages() {
    const receiveFn = (msgReceive: IMessageReceive) => {
      const existingChat = this.getEntitiesSync().find(
        (chat) => chat.id === msgReceive.chatId
      );
      const notInFreeChats =
        !this.freeChatS.getByID(msgReceive.chatId) ||
        this.freeChatS.isPendingJoin(msgReceive.chatId);

      if (!existingChat && notInFreeChats) {
        this.getChatByID(msgReceive.chatId).subscribe((newChat) => {
          this.upsertEntities([newChat]);
        });
      } else if (existingChat && notInFreeChats) {
        this.updateByID(msgReceive.chatId, {
          lastMessage: {
            ...existingChat.lastMessage,
            message: msgReceive.message,
            files: msgReceive.files,
            dateTime: msgReceive.dateTime,
            sender: { ...msgReceive.sender },
          },
          unreadMessagesCount: existingChat.unreadMessagesCount + 1,
        });
      }
    };

    const successFn = (msgSuccess: IMessageInChat) => {
      const existingChat = this.getEntitiesSync().find(
        (chat) => chat.id === msgSuccess.chatId
      );

      if (!existingChat) {
        this.getChatByID(msgSuccess.chatId).subscribe((chat) => {
          this.upsertEntities([chat]);
        });
      } else {
        this.updateByID(msgSuccess.chatId, {
          lastMessage: {
            ...existingChat.lastMessage,
            message: msgSuccess.message,
            files: msgSuccess.files,
            dateTime: msgSuccess.dateTime,
            sender: { ...msgSuccess.sender },
          },
        });
      }
    };

    this.messageS.receivedMessages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((msgReceive) => receiveFn(msgReceive));

    this.messageS.successMessages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((msgSuccess) => successFn(msgSuccess));
  }

  private registrateSocketHandlers() {
    const activeStatusFn = (statusUpdate: IUserConnectionStatus) => {
      const chatsWithUser = this.getEntitiesSync().filter((freeChat) =>
        freeChat.profiles.some((p) => p.id === statusUpdate.userId)
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

    const updateChatFn = (chatIds: string[]) => {
      this.updateChatFn$(chatIds).subscribe();
    };

    const addSendUserDataFn = (data: SetClientResponse) => {
      this.userSendInfo$.value[data.request.chatId] = {
        ...data,
        timestampSent: Date.now(),
      };
      this.userSendInfo$.next(this.userSendInfo$.value);
    };

    this.chatSocketS.listenMethod('ActiveStatus', activeStatusFn);
    this.chatSocketS.listenMethod('ChangeChat', updateChatFn);
    this.chatSocketS.listenMethod('SetClient', addSendUserDataFn);
  }

  private updateChatFn$ = (chatIds: string[]) => {
    return this.chatSearchS
      .getById$(chatIds)
      .pipe(tap((resp) => this.upsertEntities(resp.items)));
  };
}

export interface SetClientResponse {
  existed: Client | null;
  request: Omit<Client & { chatId: string }, 'id'>;
}
