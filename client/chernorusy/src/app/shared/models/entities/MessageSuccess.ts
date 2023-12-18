import {MessageType} from "../enums/MessageType";

export interface IMessageSuccess {
  messageId: string;
  chatId: string;
  requestNumber: number;
  type: MessageType;
  timeStamp: string;
}
