import {
  ChangeDetectionStrategy,
  Component, ElementRef, EventEmitter,
  Input, OnChanges, OnDestroy, Output, Renderer2,
  signal,
  ViewChild
} from '@angular/core';
import {IChatResponseDTO} from "../../../../shared/models/DTO/response/ChatResponseDTO";
import {MessageService} from "../../services/message.service";
import {IMessageInChat} from "../../../../shared/models/entities/MessageInChat";
import {filter, merge, Subject, switchMap, takeUntil, tap} from "rxjs";
import {FreeChatService} from "../../services/free-chat.service";
import {MyChatService} from "../../services/my-chat.service";
import {MessageType} from "../../../../shared/models/enums/MessageType";
import {MessagesListComponent} from "../messages-list/messages-list.component";

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageDialogComponent implements OnChanges, OnDestroy {
  @Input({required: true}) chat: IChatResponseDTO | null = null;

  @ViewChild('msgList', {static: true}) msgListElementRef!: ElementRef<HTMLUListElement>;
  @ViewChild('message') messageElementRef!: ElementRef<HTMLTextAreaElement>;

  protected msgValue = '';
  protected messages = signal<IMessageInChat[]>([]);
  private destroy$ = new Subject<void>();

  constructor(
    private messageS: MessageService,
    private myChatS: MyChatService,
    private freeChatS: FreeChatService,
    private renderer2: Renderer2,
    private messagesListComponent: MessagesListComponent
  ) {}

  ngOnChanges(): void {
    if ('chat in changes') { this.initNewChat() }
  }

  private initNewChat() {
    if (!this.chat) { return; }

    this.destroy$.next(); // уничтожаем предыдущую подписку

    this.getExistingMessagesInChat()
      .pipe(
        tap(() => this.scrollToTheBottom()),
        switchMap(() => merge(this.messageS.receivedMessages$, this.messageS.successMessages$)),
        filter(msg => msg.chatId === this.chat?.id),
        takeUntil(this.destroy$),
      ).subscribe(msg => {

      this.messages.update(messages =>
        [...messages, msg].sort((f, s) =>
          new Date(f.dateTime).getTime() - new Date(s.dateTime).getTime())
      );

      if (msg.mine) { this.scrollToTheBottom(); }
    });
  }

  private getExistingMessagesInChat() {
    return this.messageS.getMessages$(this.chat!.id)
      .pipe(
        tap(messages => {
          this.messages.set(
            messages.items.sort((f, s) =>
              new Date(f.dateTime).getTime() - new Date(s.dateTime).getTime())
          )
        })
      );
  }

  private scrollToTheBottom() {
    setTimeout(() => this.msgListElementRef.nativeElement.scrollTo({
      top: this.msgListElementRef.nativeElement.scrollHeight,
      behavior: 'instant'
    }));
  }



  protected sendMsg() {
    if (!this.msgValue.trim().length) { return; }
    this.messageS.sendMessage(this.chat?.id as string, this.msgValue)
      .then(() => {
        this.msgValue = '';
        this.renderer2.setStyle(this.messageElementRef.nativeElement, 'height', `45px`);
      });

  }

  pressKey(ev: KeyboardEvent) {
    (ev.key === 'Enter' && ev.ctrlKey) && this.sendMsg()
  }

  public resetMsgValue() {
    this.msgValue = '';
  }

  protected joinChat() {
    // не обновляем стор, т.к там рисив будет
    this.freeChatS.joinChat(this.chat!.id)
      .subscribe();
  }

  protected leaveChat() {
    this.myChatS.leaveChat(this.chat?.id as string)
      .subscribe(() => this.closeDialog());
  }
  protected closeDialog() {
    this.messagesListComponent.closeChat();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected readonly MessageType = MessageType;
}
