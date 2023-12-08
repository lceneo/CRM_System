import { Injectable } from '@angular/core';
import {IMessageReceive} from "../../models/entities/MessageReceive";
import {IMessageInChat} from "../../models/entities/MessageInChat";
import {AuthorizationService} from "../../services/authorization.service";
import {IMessageSuccess} from "../../models/entities/MessageSuccess";
import {ProfileService} from "../../services/profile.service";

@Injectable({
  providedIn: 'root'
})
export class MessageMapperService {

  constructor(
    private authorizationS: AuthorizationService,
    private profileS: ProfileService
  ) { }

   msgReceiveToMsgInChat(messReceive: IMessageReceive): IMessageInChat {
    const msgInChat: IMessageInChat & {chatId?: string}  = {
      ...messReceive,
      mine: this.authorizationS.userID === messReceive.sender.id
    };
    delete msgInChat.chatId;
    return msgInChat;
  }

  msgSuccessToMsgInChat(messSuccess: IMessageSuccess): IMessageInChat {
    return {
      id: messSuccess.messageId,
      message: messSuccess.text,
      dateTime: messSuccess.timeStamp,
      mine: true,
      sender: {
        id: this.authorizationS.userID ?? this.profileS.profile()?.id as string,
        name: this.profileS.profile()?.name as string
      }
    };
  }
}
