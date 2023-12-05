import {IProfileOutShort} from "./ProfileOutShort";

export interface IMessageReceive {
  id: string;
  chatId: string;
  sender: IProfileOutShort;
  message: string;
  dateTime: string;
}
