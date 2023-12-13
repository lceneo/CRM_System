import {IProfileOutShort} from "./ProfileOutShort";
import {MessageType} from "../enums/MessageType";

export interface IMessageInChat {
  id: string;
  chatId: string;
  sender: IProfileOutShort;
  mine?: boolean;
  message: string;
  type: MessageType;
  dateTime: string;
}
