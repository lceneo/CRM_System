import {ChangeDetectionStrategy, Component, Input, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {ChatService} from "../../services/chat.service";
import {IChatResponseDTO} from "../../../../shared/models/DTO/response/ChatResponseDTO";
import {MessageDialogComponent} from "../message-dialog/message-dialog.component";

@Component({
  selector: 'app-messages-list',
  templateUrl: './messages-list.component.html',
  styleUrls: ['./messages-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesListComponent implements OnInit {
  @Input({required: true}) tabType!: TabType;
  @ViewChild(MessageDialogComponent, {static: true}) dialog!: MessageDialogComponent;

  protected chats = this.chatService.getEntitiesAsync();
  protected selectedChat: IChatResponseDTO | null = null;

  constructor(
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
        this.chatService.initialise();
    }

  protected openDialogMessage(chat: IChatResponseDTO, dialog: HTMLElement) {
    if (this.selectedChat === chat) {
      this.selectedChat = null;
      dialog.classList.add('chats__hidden');
      return;
    }
    this.dialog.resetMsgValue();
    this.selectedChat = chat;
    dialog.classList.remove('chats__hidden');
  }
}

export type TabType = 'Inbox' | 'Mine' | 'All';
