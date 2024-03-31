import {Injectable} from '@angular/core';
import {IMessageReceive} from "../../models/entities/MessageReceive";
import {IMessageInChat} from "../../models/entities/MessageInChat";
import {AuthorizationService} from "../../services/authorization.service";
import {IMessageSuccess} from "../../models/entities/MessageSuccess";
import {ProfileService} from "../../services/profile.service";
import {IPendingMessage} from "../../../modules/chat/services/message.service";
import {MessageType} from "../../models/enums/MessageType";

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
      checkers: [],
      mine: messReceive.type !== MessageType.System && this.authorizationS.userID === messReceive.sender.id
    };
  }

  msgSuccessToMsgInChat(messSuccess: IMessageSuccess, msgData: IPendingMessage): IMessageInChat {
    const senderID = this.authorizationS.userID ?? this.profileS.profile()?.id as string;
    return {
      ...messSuccess,
      id: messSuccess.messageId,
      message: msgData.message,
      files: msgData.files,
      dateTime: messSuccess.timeStamp,
      mine: true,
      sender: {
        id: senderID,
        name: this.profileS.profile()?.name as string
      },
      checkers: [
        { id: senderID, name: this.profileS.profile()?.name as string, surname: this.profileS.profile()?.surname as string }
      ]
    };
  }

  detectMineMsgOrNot(msg: IMessageInChat) {
    return msg.sender && (msg.sender.id === this.authorizationS.userID || this.profileS.profile()?.id === msg.sender.id);
  }
}
