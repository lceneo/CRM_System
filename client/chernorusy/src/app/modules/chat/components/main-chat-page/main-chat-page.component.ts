import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {map} from "rxjs";
import {IProfileResponseDTO} from "../../../../shared/models/DTO/response/ProfileResponseDTO";
import {ProfileService} from "../../../../shared/services/profile.service";
import {MessageService} from "../../services/message.service";

@Component({
  selector: 'app-main-chat-page',
  templateUrl: './main-chat-page.component.html',
  styleUrls: ['./main-chat-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainChatPageComponent  {

  constructor(
    private profileS: ProfileService,
    private messageS: MessageService
  ) {}

}
