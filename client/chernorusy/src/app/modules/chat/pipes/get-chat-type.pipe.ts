import { Pipe, PipeTransform } from '@angular/core';
import {IChatResponseDTO} from "../../../shared/models/DTO/response/ChatResponseDTO";
import {MyChatService} from "../services/my-chat.service";
import {FreeChatService} from "../services/free-chat.service";

@Pipe({
  name: 'getChatType',
  standalone: true
})
export class GetChatTypePipe implements PipeTransform {

  constructor(
    private myChatS: MyChatService,
    private freeChatS: FreeChatService
  ) {
  }
  transform(chat: IChatResponseDTO | null): 'My' | 'Free' | 'None' {
    if (!chat) { return 'None'; }

    return this.myChatS.getEntitiesSync().find(myChat => myChat.id === chat.id) ? 'My' :
      (this.freeChatS.getEntitiesSync().find(freeChat => freeChat.id === chat.id) ? 'Free' : 'None');
  }

}
