import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, DestroyRef,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy, OnInit,
  Renderer2,
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
import {MessagesListComponent, TabType} from "../messages-list/messages-list.component";
import {ChatStatus} from "../../../../shared/models/enums/ChatStatus";
import {MainChatPageComponent} from "../main-chat-page/main-chat-page.component";
import {FileMapperService} from "../../../../shared/helpers/mappers/file-mapper.service";

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageDialogComponent implements OnChanges, OnDestroy {
  @Input({required: true}) chat: IChatResponseDTO | null = null;
  @Input({required: true}) chatType: TabType | null = null;

  @ViewChild('msgList') msgListElementRef!: ElementRef<HTMLUListElement>;
  @ViewChild('message') messageElementRef!: ElementRef<HTMLTextAreaElement>;

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  protected msgValue = '';
  protected currentFile?: File;

  protected messages = signal<IMessageInChat[]>([]);
  protected loadingChat$ = new Subject<boolean>();
  private destroy$ = new Subject<void>();

  constructor(
    private messageS: MessageService,
    private myChatS: MyChatService,
    private freeChatS: FreeChatService,
    private fileMapper: FileMapperService,
    private renderer2: Renderer2,
    private messagesListComponent: MessagesListComponent,
    private mainChat: MainChatPageComponent,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(): void {
    if ('chat in changes') { this.initNewChat(); }
  }

  private initNewChat() {
    if (!this.chat) { return; }

    this.destroy$.next(); // уничтожаем предыдущую подписку
    this.loadingChat$.next(true);

    this.getExistingMessagesInChat()
      .pipe(
        tap(() => { this.loadingChat$.next(false); this.scrollToTheBottom(); }),
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
    setTimeout(() => this.msgListElementRef?.nativeElement.scrollTo({
      top: this.msgListElementRef.nativeElement.scrollHeight,
      behavior: 'instant'
    }));
  }



  protected sendMsg() {

    // для отправки надо, чтоб сообщение было не пустым или чтоб был файл
    if (!this.msgValue.trim().length && !this.currentFile) { return; }

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

  protected onFileChange(event: Event) {
    //@ts-ignore;
    const files = event.target['files'] as FileList;

    if (!files || !files.length) { return; }
    else {
      this.currentFile = files.item(0) as File;
      this.cdr.detectChanges();
    }
  }

  protected joinChat() {
    // не обновляем стор, т.к там рисив будет
    this.freeChatS.joinChat(this.chat!.id)
      .pipe(
        tap(() => this.mainChat.changeTab('Мои', this.chat!))
      )
      .subscribe();
  }

  protected leaveChat() {
    this.myChatS.leaveChat(this.chat?.id as string)
      .subscribe(() => this.closeDialog());
  }
  protected closeDialog() {
    this.messagesListComponent.closeChat();
  }

  protected toggleBlockStatus() {
    const newStatus = this.chat?.status === ChatStatus.Active ? ChatStatus.Blocked : ChatStatus.Active;
    this.myChatS.changeChatStatus(this.chat!.id, newStatus)
      .pipe(
        tap(() => this.closeDialog())
      )
      .subscribe();
  }

  protected toggleArchiveStatus() {
    const newStatus = this.chat?.status === ChatStatus.Archive ? ChatStatus.Active : ChatStatus.Archive;
    this.myChatS.changeChatStatus(this.chat!.id, newStatus)
      .pipe(
        tap(() => this.closeDialog())
      )
      .subscribe();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected readonly MessageType = MessageType;
  protected readonly ChatStatus = ChatStatus;
}
