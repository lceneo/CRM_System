import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {IMessage} from "../../services/message.service";

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageDialogComponent {
  @Input() message: IMessage | null = null;
}
