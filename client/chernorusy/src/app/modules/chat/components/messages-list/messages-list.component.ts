import {ChangeDetectionStrategy, Component, computed, Input, OnInit, Signal, ViewChild} from '@angular/core';
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
export class MessagesListComponent implements OnInit {
  @Input({required: true}) tabType!: TabType;
  @ViewChild(MessageDialogComponent, {static: true}) dialog!: MessageDialogComponent;

  protected chats?: Signal<IChatResponseDTO[]>;

  protected selectedChat: IChatResponseDTO | null = null;

  constructor(
    private myChatS: MyChatService,
    private freeChatS: FreeChatService
  ) {}

  ngOnInit(): void {
    const myChats = this.myChatS.getEntitiesAsync();
    const freeChats = this.freeChatS.getEntitiesAsync();

        switch (this.tabType) {
          case 'Mine' :
            this.chats = myChats;
            break;
          case 'Inbox':
            this.chats = freeChats;
            break;
          case 'All':
            this.chats = computed(() => [...myChats(), ...freeChats()]);
            break;
        }

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
