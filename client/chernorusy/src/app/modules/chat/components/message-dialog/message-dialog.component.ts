import {
  ChangeDetectionStrategy,
  Component, ElementRef,
  Input, OnChanges, OnDestroy,
  signal,
  ViewChild
} from '@angular/core';
import {IChatResponseDTO} from "../../../../shared/models/DTO/response/ChatResponseDTO";
import {MessageService} from "../../services/message.service";
import {IMessageInChat} from "../../../../shared/models/entities/MessageInChat";
import {filter, merge, Subject, switchMap, takeUntil, tap} from "rxjs";

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageDialogComponent implements OnChanges, OnDestroy {
  @Input({required: true}) chat: IChatResponseDTO | null = null;

  @ViewChild('msgList', {static: true}) msgListElementRef!: ElementRef<HTMLUListElement>;

  protected msgValue = '';
  protected messages = signal<IMessageInChat[]>([]);
  private destroy$ = new Subject<void>();

  constructor(
    private messageS: MessageService
  ) {}

  ngOnChanges(): void {
    if ('chat in changes') { this.initNewChat() }
  }

  private initNewChat() {
    if (!this.chat) { return; }

    this.destroy$.next(); // уничтожаем предыдущую подписку

    this.getExistingMessagesInChat()
      .pipe(
        switchMap(() => merge(this.messageS.receivedMessages$, this.messageS.successMessages$)),
        filter(msg => msg.chatId === this.chat?.id),
        takeUntil(this.destroy$),
      ).subscribe(msg => {

      this.messages.update(messages =>
        [...messages, msg].sort((f, s) => new Date(f.dateTime).getTime() - new Date(s.dateTime).getTime()));

      if (msg.mine) {
        setTimeout(() => this.msgListElementRef.nativeElement.scrollTo({
          top: this.msgListElementRef.nativeElement.scrollHeight,
          behavior: 'instant'
        }));
      }
    });
  }

  private getExistingMessagesInChat() {
    return this.messageS.getMessages$(this.chat!.id)
      .pipe(
        tap(messages => {
          this.messages.set(
            messages.items.sort((f, s) => new Date(f.dateTime).getTime() - new Date(s.dateTime).getTime()))
        })
      );
  }


  protected sendMsg() {
    if (!this.msgValue.trim().length) { return; }
    this.messageS.sendMessage(this.chat?.id as string, this.msgValue)
      .then(() => this.msgValue = '');
  }

  pressKey(ev: KeyboardEvent) {
    (ev.key === 'Enter' && ev.ctrlKey) && this.sendMsg()
  }

  public resetMsgValue() {
    this.msgValue = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
