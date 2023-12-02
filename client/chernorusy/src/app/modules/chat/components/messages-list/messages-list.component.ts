import {ChangeDetectionStrategy, Component, Input, signal} from '@angular/core';
import {IMessage, MessageService} from "../../services/message.service";
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

  protected messages$ = this.messageS.getMessages$();
  protected chats = this.chatService.getEntitiesAsync();
  protected selectedChat: IChatResponseDTO | null = null;

  constructor(
    private chatService: ChatService,
    private messageS: MessageService,
  ) {}

  protected openDialogMessage(message: IChatResponseDTO, dialog: HTMLElement) {
    if (this.selectedChat === message) {
      this.selectedChat = null;
      dialog.classList.add('messages__hidden');
      return;
    }
    this.selectedChat = message;
    dialog.classList.remove('messages__hidden');
  }
}

export type TabType = 'Inbox' | 'Mine' | 'All';
