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
export class MainChatPageComponent implements OnInit {

  constructor(
    private profileS: ProfileService,
    private messageS: MessageService
  ) {}
  sendToAdmin(){
    this.profileS.getProfiles$()
      .pipe(
        map(profiles => (profiles?.items.find(p => p.name === 'Name of admin') as IProfileResponseDTO).id)
      ).subscribe(id => this.messageS.sendMessage(id, 'msgToAdmin'));
  }

  sendToClient(){
    this.profileS.getProfiles$()
      .pipe(
        map(profiles => (profiles?.items.find(p => p.name === 'Name of client') as IProfileResponseDTO).id)
      ).subscribe(id => this.messageS.sendMessage(id, 'msgToClient'));
  }

  ngOnInit(): void {
    this.messageS.init();
  }

}
