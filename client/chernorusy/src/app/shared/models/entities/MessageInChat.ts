import {IProfileOutShort} from "./ProfileOutShort";
import {MessageType} from "../enums/MessageType";
import {FileType} from "./FileType";
import {IFileInMessage} from "./FileInMessage";

export interface IMessageInChat {
  id: string;
  chatId: string;
  sender: IProfileOutShort;
  mine?: boolean;
  message?: string;
  files: IFileInMessage[];
  type: MessageType;
  dateTime: string;
  checkers: Omit<IProfileOutShort, 'isConnected'>[];
}
