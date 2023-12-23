import {
  ChangeDetectionStrategy,
  Component,
  computed, effect,
  ElementRef, Injector,
  Input,
  OnInit, signal,
  Signal,
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
export class MessagesListComponent implements OnInit {
  @Input({required: true}) tabType!: TabType;
  @ViewChild(MessageDialogComponent, {static: true}) dialog!: MessageDialogComponent;
  @ViewChild('dialog', {static: true}) dialogWrapper!: ElementRef<HTMLElement>;

  protected chats?: Signal<IChatResponseDTO[]>;
  protected selectedChat: IChatResponseDTO | null = null;

  constructor(
    private myChatS: MyChatService,
    private freeChatS: FreeChatService,
    private injector: Injector
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
            effect(() => {
              const currentFreeChats = freeChats();
              if (!this.selectedChat) { return; }
              else if (!currentFreeChats.find(freeChat => freeChat.id === this.selectedChat?.id)) { this.closeChat(); }
            }, {injector: this.injector})
            break;
          case 'All':
            this.chats = computed(() => [...myChats(), ...freeChats()]);
            break;
        }

    }


  protected openDialogMessage(chat: IChatResponseDTO) {
    if (this.selectedChat?.id === chat.id) {
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

export type TabType = 'Inbox' | 'Mine' | 'All';
