import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {IMessageInChat} from "../../../../shared/models/entities/MessageInChat";
import {MessageType} from "../../../../shared/models/enums/MessageType";

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageComponent {

  @Input({required: true}) message?: IMessageInChat;


  protected readonly MessageType = MessageType;
}
