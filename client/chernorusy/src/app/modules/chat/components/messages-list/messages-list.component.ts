import {ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {ChatService} from "../../services/chat.service";
import {IChatResponseDTO} from "../../../../shared/models/DTO/response/ChatResponseDTO";

@Component({
  selector: 'app-messages-list',
  templateUrl: './messages-list.component.html',
  styleUrls: ['./messages-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesListComponent {
  @Input({required: true}) tabType!: TabType;

  protected chats = this.chatService.getEntitiesAsync();
  protected selectedChat: IChatResponseDTO | null = null;

  constructor(
    private chatService: ChatService
  ) {}

  protected openDialogMessage(chat: IChatResponseDTO, dialog: HTMLElement) {
    if (this.selectedChat === chat) {
      this.selectedChat = null;
      dialog.classList.add('chats__hidden');
      return;
    }
    this.selectedChat = chat;
    dialog.classList.remove('chats__hidden');
  }
}

export type TabType = 'Inbox' | 'Mine' | 'All';
