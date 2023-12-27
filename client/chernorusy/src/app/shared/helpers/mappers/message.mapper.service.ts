import { Injectable } from '@angular/core';
import {IMessageReceive} from "../../models/entities/MessageReceive";
import {IMessageInChat} from "../../models/entities/MessageInChat";
import {AuthorizationService} from "../../services/authorization.service";
import {IMessageSuccess} from "../../models/entities/MessageSuccess";
import {ProfileService} from "../../services/profile.service";
import {ISendMessageRequest} from "../../models/DTO/request/SendMessageRequest";
import {FileMapperService} from "./file-mapper.service";

@Injectable({
  providedIn: 'root'
})
export class MessageMapperService {

  constructor(
    private authorizationS: AuthorizationService,
    private profileS: ProfileService,
    private fileMapperS: FileMapperService
  ) { }

   msgReceiveToMsgInChat(messReceive: IMessageReceive): IMessageInChat {
   return  {
      ...messReceive,
      mine: this.authorizationS.userID === messReceive.sender.id,
      fileType: this.fileMapperS.getFileType(messReceive.fileUrl)
    };
  }

  msgSuccessToMsgInChat(messSuccess: IMessageSuccess, msgData: Pick<ISendMessageRequest, 'message' | 'fileUrl'>): IMessageInChat {
    return {
      ...messSuccess,
      id: messSuccess.messageId,
      message: msgData.message,
      fileUrl: msgData.fileUrl,
      dateTime: messSuccess.timeStamp,
      mine: true,
      sender: {
        id: this.authorizationS.userID ?? this.profileS.profile()?.id as string,
        name: this.profileS.profile()?.name as string
      }
    };
  }

  detectMineMsgOrNot(msg: IMessageInChat) {
    return msg.sender && (msg.sender.id === this.authorizationS.userID || this.profileS.profile()?.id === msg.sender.id);
  }
}
