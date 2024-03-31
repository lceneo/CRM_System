import {Injectable} from '@angular/core';
import {SocketService} from "../../../shared/services/socket.service";
import {HttpService} from "../../../shared/services/http.service";
import {IMessageInChat} from "../helpers/entities/MessageInChat";
import {IMessageInChatResponseDTO} from "../helpers/DTO/request/MessageInChatResponseDTO";
import {map, Subject } from "rxjs";
import {IMessageReceive} from "../helpers/entities/MessageReceive";
import {IMessageSuccess} from "../helpers/entities/MessageSuccess";
import {MessageMapperService} from "../helpers/mappers/message.mapper.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MAX_INT} from "../../../shared/helpers/constants/constants";
import {ISendMessageRequest} from "../helpers/DTO/request/SendMessageRequest";
import {IFileInMessage} from "../helpers/entities/FileInMessage";

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  public receivedMessages$ = new Subject<IMessageInChat>();
  public successMessages$ = new Subject<IMessageInChat>();

  private requestNumber = 1;
  private pendingMessages: {[requestNumber: number]: IPendingMessage} = {};
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
    return this.httpS.get<IMessageInChatResponseDTO>(`/Chats/${chatID}/Messages?Skip=0&Take=${MAX_INT}`)
      .pipe(
        map(messages => (
          {...messages,
            items: messages.items.map(msg => ({...msg, mine: this.messageMapper.detectMineMsgOrNot(msg)}))
          }))
      );
  }

  public async readMessages(chatID: string, messagesIDs: string[]) {
    return await this.socketS.sendMessage('Check', { chatID: chatID, messageIds: messagesIDs });
  }

  public sendMessage(userOrChatID: string, messageData: IPendingMessage) {
    this.pendingMessages[this.requestNumber] = { message: messageData.message, files: messageData.files };
    const sendMsgObj: ISendMessageRequest = {
      "recipientId": userOrChatID,
      "requestNumber": this.requestNumber++
    };

    if (messageData.message) { sendMsgObj['message'] = messageData.message; }
    sendMsgObj['fileKeys'] = messageData.files.map(file => file.fileKey);
    return this.socketS.sendMessage('Send', sendMsgObj);
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
}

export interface IPendingMessage {
  message?: string;
  files: IFileInMessage[];
}
