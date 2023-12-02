import {ChangeDetectionStrategy, Component, Input, signal} from '@angular/core';
import {IMessage, MessageService} from "../../services/message.service";

@Component({
  selector: 'app-messages-list',
  templateUrl: './messages-list.component.html',
  styleUrls: ['./messages-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesListComponent {
  @Input({required: true}) tabType!: TabType;

  protected messages$ = this.messageS.getMessages$();
  protected selectedMessage: IMessage | null = null;

  constructor(
    private messageS: MessageService
  ) {}

  protected openDialogMessage(message: IMessage, dialog: HTMLElement) {
    if (this.selectedMessage === message) {
      this.selectedMessage = null;
      dialog.classList.add('messages__hidden');
      return;
    }
    this.selectedMessage = message;
    dialog.classList.remove('messages__hidden');
  }
}

export type TabType = 'Inbox' | 'Mine' | 'All';
