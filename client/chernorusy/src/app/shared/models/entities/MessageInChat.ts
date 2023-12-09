import {IProfileOutShort} from "./ProfileOutShort";

export interface IMessageInChat {
  id: string;
  chatId: string;
  sender: IProfileOutShort;
  mine?: boolean;
  message: string;
  dateTime: string;
}
