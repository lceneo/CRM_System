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
   return  {
      ...messReceive,
      mine: this.authorizationS.userID === messReceive.sender.id
    };
  }

  msgSuccessToMsgInChat(messSuccess: IMessageSuccess, msgText: string): IMessageInChat {
    return {
      ...messSuccess,
      id: messSuccess.messageId,
      message: msgText,
      dateTime: messSuccess.timeStamp,
      mine: true,
      sender: {
        id: this.authorizationS.userID ?? this.profileS.profile()?.id as string,
        name: this.profileS.profile()?.name as string
      }
    };
  }

  detectMineMsgOrNot(msg: IMessageInChat) {
    return msg.sender.id === this.authorizationS.userID || this.profileS.profile()?.id === msg.sender.id;
  }
}
