import {
  ChangeDetectionStrategy,
  Component, effect,
  ElementRef, EventEmitter, Injector,
  Input, OnChanges,
  OnInit, Output,
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
  @Input() selectedChatID?: string;
  @Output() selectedChatIDChange = new EventEmitter<string | undefined>();

  @ViewChild(MessageDialogComponent, {static: true}) dialog!: MessageDialogComponent;
  @ViewChild('dialog', {static: true}) dialogWrapper!: ElementRef<HTMLElement>;

  protected chats?: Signal<IChatResponseDTO[]>;

  constructor(
    private myChatS: MyChatService,
    private freeChatS: FreeChatService,
    private injector: Injector
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('selectedChatID' in changes && this.selectedChatID) {
      this.openDialogMessage(this.selectedChatID, true);
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
              if (!this.selectedChatID) { return; }
              else if (!currentFreeChats.find(freeChat => freeChat.id === this.selectedChatID)) { this.closeChat(); }
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

    public activateTab() {
      this.selectedChatIDChange.emit(this.selectedChatID);
    }


  protected openDialogMessage(chatID: string, fromOtherTab = false) {
    if (this.selectedChatID === chatID && !fromOtherTab) {
      this.closeChat();
      return;
    }
    this.dialog.resetMsgValue();
    this.selectedChatID = chatID;
    this.selectedChatIDChange.emit(chatID);
    this.dialogWrapper.nativeElement.classList.remove('chats__hidden');
  }

  public closeChat() {
    this.selectedChatID = undefined;
    this.selectedChatIDChange.next(undefined);
    this.dialogWrapper.nativeElement.classList.add('chats__hidden');
    this.dialog.resetMsgValue();
  }

}

export type TabType = 'Inbox' | 'Mine' | 'Archive' | 'Block';
