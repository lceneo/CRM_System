import {ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild} from '@angular/core';
import {IMessageInChat} from "../../../../shared/models/entities/MessageInChat";
import {MessageType} from "../../../../shared/models/enums/MessageType";
import {MatDialog} from "@angular/material/dialog";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {ImageFullscreenComponent} from "../image-fullscreen/image-fullscreen.component";

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageComponent {

  @Input({required: true}) message?: IMessageInChat;

  constructor(
    private matDialog: MatDialog
  ) {}

  protected openImage(dataUrl: string) {
    this.matDialog.open(ImageFullscreenComponent, {
      data: {
        dataUrl: dataUrl
      }});
  }

  protected readonly MessageType = MessageType;
}
