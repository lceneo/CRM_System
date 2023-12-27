import {IProfileOutShort} from "./ProfileOutShort";
import {MessageType} from "../enums/MessageType";
import {FileType} from "./FileType";

export interface IMessageInChat {
  id: string;
  chatId: string;
  sender: IProfileOutShort;
  mine?: boolean;
  message?: string;
  fileName?: string;
  type: MessageType;
  dateTime: string;
}
