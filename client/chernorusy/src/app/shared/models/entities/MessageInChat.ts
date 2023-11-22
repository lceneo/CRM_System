import {IProfileOutShort} from "./ProfileOutShort";

export interface IMessageInChat {
  Id: string;
  Sender: IProfileOutShort;
  Message: string;
  DateTime: Date;
}
