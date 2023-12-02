import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {IMessage} from "../../services/message.service";
import {TabType} from "../messages-list/messages-list.component";

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageComponent {
  @Input({required: true}) message!: IMessage;
  @Input({required: true}) messageType!: TabType;
}
