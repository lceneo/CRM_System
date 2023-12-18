import {Injectable, OnDestroy, signal} from '@angular/core';
import {SocketService} from "../../../shared/services/socket.service";
import {HttpService} from "../../../shared/services/http.service";
import {IMessageInChat} from "../../../shared/models/entities/MessageInChat";
import {IMessageInChatResponseDTO} from "../../../shared/models/DTO/request/MessageInChatResponseDTO";
import {map, Subject, takeUntil} from "rxjs";
import {IMessageReceive} from "../../../shared/models/entities/MessageReceive";
import {IMessageSuccess} from "../../../shared/models/entities/MessageSuccess";
import {MessageMapperService} from "../../../shared/helpers/mappers/message.mapper.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  public receivedMessages$ = new Subject<IMessageInChat>();
  public successMessages$ = new Subject<IMessageInChat>();

  private requestNumber = 1;
  private pendingMessages: {[requestNumber: number]: string} = {};
  constructor(
    private socketS: SocketService,
    private httpS: HttpService,
    private messageMapper: MessageMapperService
  ) {
    if (this.socketS.isConnected()) { this.listenSocket(); }

    this.socketS.connected$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe(() => this.listenSocket());
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
    console.log('messageS init')
    const receiveFn = (msgReceive: IMessageReceive) => {
      this.receivedMessages$.next(this.messageMapper.msgReceiveToMsgInChat(msgReceive));
    }

    const successFn = (msgSuccess: IMessageSuccess) => {
      this.successMessages$.next(this.messageMapper.msgSuccessToMsgInChat(msgSuccess, this.pendingMessages[msgSuccess.requestNumber]));
    }

    this.socketS.listenMethod('Recieve', receiveFn);
    this.socketS.listenMethod('Success', successFn);
  }

  public getMessageTextByRequestNumber(requestNumber: number) {
    return this.pendingMessages[requestNumber];
  }
}
