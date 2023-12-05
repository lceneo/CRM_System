import {IProfileOutShort} from "./ProfileOutShort";

export interface IMessageInChat {
  id: string;
  sender: IProfileOutShort;
  message: string;
  dateTime: string;
}
