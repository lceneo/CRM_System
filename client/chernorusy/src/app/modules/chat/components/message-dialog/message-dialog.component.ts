import {
  ChangeDetectionStrategy,
  Component, ElementRef,
  Input,
  OnChanges,
  signal,
  SimpleChanges, ViewChild
} from '@angular/core';
import {IChatResponseDTO} from "../../../../shared/models/DTO/response/ChatResponseDTO";
import {MessageService} from "../../services/message.service";
import {IMessageInChat} from "../../../../shared/models/entities/MessageInChat";
import {map, tap} from "rxjs";
import {SocketService} from "../../../../shared/services/socket.service";
import {IMessageReceive} from "../../../../shared/models/entities/MessageReceive";
import {msgReceiveToMsgInChat} from "../../../../shared/helpers/mappers/message.mapper";
import {IMessageSuccess} from "../../../../shared/models/entities/MessageSuccess";
import {ProfileService} from "../../../../shared/services/profile.service";
import {AuthorizationService} from "../../../../shared/services/authorization.service";
import {MessageMapperService} from "../../../../shared/helpers/mappers/message.mapper.service";

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageDialogComponent implements OnChanges{
  @Input({required: true}) chat: IChatResponseDTO | null = null;
  @Input({required: true}) isVisible = false;

  @ViewChild('msgList', {static: true}) msgListElementRef!: ElementRef<HTMLUListElement>;

  protected msgValue = '';
  protected messages = signal<IMessageInChat[]>([]);
  protected existingReceiveFn?: (...args: any[]) => void;
  protected existingSuccessFn?: (...args: any[]) => void;
  private dialogInitted = false;

  constructor(
    private messageS: MessageService,
    private socketS: SocketService,
    private authorizationS: AuthorizationService,
    private messageMapper: MessageMapperService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    //@ts-ignore
    if (this.isVisible &&
      ('chat in changes' || !this.dialogInitted)) {
      this.initAndListenNewChat(changes['chat'].currentValue.id)
    }
  }

  private initAndListenNewChat(chatID: string) {
    this.existingReceiveFn && this.socketS.unsubscribeFromMethod('Recieve', this.existingReceiveFn);
    this.existingSuccessFn && this.socketS.unsubscribeFromMethod('Success', this.existingSuccessFn);

    this.messageS.getMessages$(chatID)
      .pipe(
        tap(() => {

          this.existingReceiveFn = (msg: IMessageReceive) => {
            if (msg.chatId !== this.chat?.id) { return; }
            this.addMsgInChat(this.messageMapper.msgReceiveToMsgInChat(msg));
          };

          this.existingSuccessFn = (msg: IMessageSuccess) => {
            if (msg.chatId !== this.chat?.id) { return; }
            this.addMsgInChat(this.messageMapper.msgSuccessToMsgInChat(msg), true);
            };

          this.socketS.listenMethod('Recieve', this.existingReceiveFn);
          this.socketS.listenMethod('Success', this.existingSuccessFn);
        }),
        map(
          messages => {
            return messages.items
              .sort((f, s) => new Date(f.dateTime).getTime() - new Date(s.dateTime).getTime())
              .map(msg => ({...msg, mine: msg.sender.id === this.authorizationS.userID}));
          }
        )
      )
      .subscribe(messages => this.messages.set(messages)
      );
    this.dialogInitted = true;
  }

  protected sendMsg() {
    if (!this.msgValue.trim().length) { return; }
    this.messageS.sendMessage(this.chat?.id as string, this.msgValue, 0)
      .then(() => this.msgValue = '');
  }

  private addMsgInChat(msg: IMessageInChat, scrollToBottom = false) {
    this.messages.update(msgs => [...msgs, msg]
      .sort((f, s) => new Date(f.dateTime).getTime() - new Date(s.dateTime).getTime()));
    if (scrollToBottom) {
      setTimeout(() => {
        this.msgListElementRef.nativeElement.scrollTo({top: this.msgListElementRef.nativeElement.scrollHeight, behavior: 'instant'}) }
      , 0);
    }
  }

  pressKey(ev: KeyboardEvent) {
    (ev.key === 'Enter' && ev.ctrlKey) && this.sendMsg()
  }

  public resetMsgValue() {
    this.msgValue = '';
  }
}
