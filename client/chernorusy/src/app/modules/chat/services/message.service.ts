import {Injectable, OnDestroy, signal} from '@angular/core';
import {SocketService} from "../../../shared/services/socket.service";
import {HttpService} from "../../../shared/services/http.service";
import {IMessageInChat} from "../../../shared/models/entities/MessageInChat";
import {IMessageInChatResponseDTO} from "../../../shared/models/DTO/request/MessageInChatResponseDTO";
import {map, Subject, takeUntil} from "rxjs";
import {IMessageReceive} from "../../../shared/models/entities/MessageReceive";
import {IMessageSuccess} from "../../../shared/models/entities/MessageSuccess";
import {MessageMapperService} from "../../../shared/helpers/mappers/message.mapper.service";
import {ChatService} from "./chat.service";

@Injectable({
  providedIn: 'root'
})
export class MessageService implements OnDestroy {

  public receivedMessages$ = new Subject<IMessageInChat>();
  public successMessages$ = new Subject<IMessageInChat>();
  private needToListenForSocket = true;

  private requestNumber = 1;
  private pendingMessages: {[requestNumber: number]: string} = {};
  private destroy$ = new Subject<void>();
  constructor(
    private socketS: SocketService,
    private httpS: HttpService,
    private chatS: ChatService,
    private messageMapper: MessageMapperService
  ) {}

  public init() {
    if (this.needToListenForSocket) {
      console.log('init')
      this.listenSocket();
    }
  }
  public getMessages$(chatID: string) {
    return this.httpS.get<IMessageInChatResponseDTO>(`/Chats/${chatID}/Messages`)
      .pipe(
        map(messages => (
          {...messages,
            items: messages.items.map(msg => ({...msg, mine: this.messageMapper.detectMineMsgOrNot(msg)}))
          }))
      );
  }

  public sendMessage(userOrChatID: string, messageText: string) {
    this.pendingMessages[this.requestNumber] = messageText;

    return this.socketS.sendMessage('Send', {
      "recipientId": userOrChatID,
      "message": messageText,
      "requestNumber": this.requestNumber++
    });
  }

  private listenSocket() {
    const receiveFn = (msgReceive: IMessageReceive) => {
      const existingChat = this.chatS.getEntitiesSync().find(chat => chat.id === msgReceive.chatId);

      if (!existingChat) { this.chatS.getChatByID(msgReceive.chatId).subscribe(chat => this.chatS.upsertEntities([chat])); }
      else {
        this.chatS.updateByID(msgReceive.chatId,
          {lastMessage: {...existingChat.lastMessage, message: msgReceive.message, dateTime: msgReceive.dateTime, sender: {...msgReceive.sender} }
          });
      }

      this.receivedMessages$.next(this.messageMapper.msgReceiveToMsgInChat(msgReceive));
    }

    const successFn = (msgSuccess: IMessageSuccess) => {
      const msgInChat = this.messageMapper.msgSuccessToMsgInChat(msgSuccess, this.pendingMessages[msgSuccess.requestNumber]);
      const existingChat = this.chatS.getEntitiesSync().find(chat => chat.id === msgSuccess.chatId);

      if (!existingChat) { this.chatS.getChatByID(msgSuccess.chatId).subscribe(chat => this.chatS.upsertEntities([chat])); }
      else {
        this.chatS.updateByID(msgSuccess.chatId,
          {lastMessage: {...existingChat.lastMessage, message: msgInChat.message, dateTime: msgInChat.dateTime, sender: {...msgInChat.sender} }
          });
      }

      this.successMessages$.next(msgInChat);
    }

    this.needToListenForSocket = false;
    this.socketS.listenMethod('Recieve', receiveFn);
    this.socketS.listenMethod('Success', successFn);
    this.socketS.disconnected$
      .pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => this.needToListenForSocket = true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
