import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  signal,
  SimpleChanges
} from '@angular/core';
import {IChatResponseDTO} from "../../../../shared/models/DTO/response/ChatResponseDTO";
import {MessageService} from "../../services/message.service";
import {IMessageInChat} from "../../../../shared/models/entities/MessageInChat";
import {tap} from "rxjs";
import {SocketService} from "../../../../shared/services/socket.service";
import {IMessageReceive} from "../../../../shared/models/entities/MessageReceive";
import {msgReceiveToMsgInChat} from "../../../../shared/helpers/mappers/message.mapper";
import {IMessageSuccess} from "../../../../shared/models/entities/MessageSuccess";

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageDialogComponent implements OnChanges{
  @Input({required: true}) chat: IChatResponseDTO | null = null;
  @Input({required: true}) isVisible = false;

  protected msgValue = '';
  protected messages = signal<IMessageInChat[]>([]);
  protected existingReceiveFn?: (...args: any[]) => void;
  protected existingSuccessFn?: (...args: any[]) => void;
  private msgs: {[p: number]: string} = {};
  private dialogInitted = false;
  private curretQuery = 0;

  constructor(
    private messageS: MessageService,
    private socketS: SocketService
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
    this.curretQuery = 0;

    this.messageS.getMessages$(chatID)
      .pipe(
        tap(() => {
          this.existingReceiveFn = (msg: IMessageReceive) => this.messages.update(msgs => [...msgs, msgReceiveToMsgInChat(msg)]);
          this.existingSuccessFn = (msg: IMessageSuccess) => {
            this.messages.update(msgs => [...msgs, {
              message: this.msgs[msg.requestNumber],
              dateTime: new Date().toLocaleDateString(),
              id: '123',
              sender: {id: '', name: 'ds'}
            }]);
          };
          this.socketS.listenMethod('Recieve', this.existingReceiveFn);
          this.socketS.listenMethod('Success', this.existingSuccessFn);
        })
      )
      .subscribe(messages => this.messages.set(messages.items));
    this.dialogInitted = true;
  }

  protected sendMsg() {
    this.messageS.sendMessage(this.chat?.id as string, this.msgValue, this.curretQuery)
      .then(() => this.msgValue = '');
    this.msgs[this.curretQuery] = this.msgValue;
    this.curretQuery++;
  }

  pressKey(ev: KeyboardEvent) {
    ev.key === 'Enter' && this.sendMsg()
  }
}
