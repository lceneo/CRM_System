import {IProfileOutShort} from "./ProfileOutShort";

export interface IMessageInChat {
  id: string;
  sender: IProfileOutShort;
  mine?: boolean;
  message: string;
  dateTime: string;
}
