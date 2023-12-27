import {IProfileOutShort} from "./ProfileOutShort";
import {MessageType} from "../enums/MessageType";

export interface IMessageReceive {
  id: string;
  chatId: string;
  sender: IProfileOutShort;
  message?: string;
  fileName?: string;
  type: MessageType;
  dateTime: string;
}
