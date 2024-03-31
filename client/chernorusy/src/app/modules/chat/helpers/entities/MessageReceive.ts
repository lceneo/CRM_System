import {IProfileOutShort} from "../../../profile/entities/ProfileOutShort";
import {MessageType} from "../enums/MessageType";
import {IFileInMessage} from "./FileInMessage";

export interface IMessageReceive {
  id: string;
  chatId: string;
  sender: IProfileOutShort;
  message?: string;
  files: IFileInMessage[];
  type: MessageType;
  dateTime: string;
}
