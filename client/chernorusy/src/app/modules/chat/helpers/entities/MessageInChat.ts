import {IProfileOutShort} from "../../../profile/entities/ProfileOutShort";
import {MessageType} from "../enums/MessageType";
import {FileType} from "./FileType";
import {IFileInMessage} from "./FileInMessage";
import {ICheckerInfo} from "./CheckerInfo";

export interface IMessageInChat {
  id: string;
  chatId: string;
  sender: IProfileOutShort;
  mine?: boolean;
  message?: string;
  files: IFileInMessage[];
  type: MessageType;
  dateTime: string;
  checkers: ICheckerInfo[];
}
