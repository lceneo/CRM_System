import {
  ChangeDetectionStrategy,
  Component, effect,
  ElementRef, Injector,
  Input, OnChanges,
  OnInit,
  Signal, SimpleChanges,
  ViewChild
} from '@angular/core';
import {IChatResponseDTO} from "../../../../shared/models/DTO/response/ChatResponseDTO";
import {MessageDialogComponent} from "../message-dialog/message-dialog.component";
import {MyChatService} from "../../services/my-chat.service";
import {FreeChatService} from "../../services/free-chat.service";

@Component({
  selector: 'app-messages-list',
  templateUrl: './messages-list.component.html',
  styleUrls: ['./messages-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesListComponent implements OnChanges, OnInit {
  @Input({required: true}) tabType!: TabType;
  @Input() selectedChat: IChatResponseDTO | null = null;

  @ViewChild(MessageDialogComponent, {static: true}) dialog!: MessageDialogComponent;
  @ViewChild('dialog', {static: true}) dialogWrapper!: ElementRef<HTMLElement>;

  protected chats?: Signal<IChatResponseDTO[]>;

  constructor(
    private myChatS: MyChatService,
    private freeChatS: FreeChatService,
    private injector: Injector
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('selectedChat' in changes && this.selectedChat) {
      this.openDialogMessage(this.selectedChat, true);
    }
  }
  ngOnInit(): void {
        switch (this.tabType) {
          case 'Mine' :
            this.chats = this.myChatS.getActiveChatsAsync();
            break;
          case 'Inbox':
            this.chats = this.freeChatS.getEntitiesAsync();
            effect(() => {
              const currentFreeChats = this.chats!();
              if (!this.selectedChat) { return; }
              else if (!currentFreeChats.find(freeChat => freeChat.id === this.selectedChat?.id)) { this.closeChat(); }
            }, {injector: this.injector})
            break;
          case 'Archive':
            this.chats = this.myChatS.getArchiveChatsAsync();
            break;
          case 'Block':
            this.chats = this.myChatS.getBlockedChatsAsync();
            break;
        }
    }


  protected openDialogMessage(chat: IChatResponseDTO, fromOtherTab = false) {
    if (this.selectedChat?.id === chat.id && !fromOtherTab) {
      this.closeChat();
      return;
    }
    this.dialog.resetMsgValue();
    this.selectedChat = chat;
    this.dialogWrapper.nativeElement.classList.remove('chats__hidden');
  }

  public closeChat() {
    this.selectedChat = null;
    this.dialogWrapper.nativeElement.classList.add('chats__hidden');
    this.dialog.resetMsgValue();
  }

}

export type TabType = 'Inbox' | 'Mine' | 'Archive' | 'Block';
