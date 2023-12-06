import {IMessageReceive} from "../../models/entities/MessageReceive";
import {IMessageInChat} from "../../models/entities/MessageInChat";

export const msgReceiveToMsgInChat = (messReceive: IMessageReceive): IMessageInChat => {
  const msgInChat: Partial<IMessageReceive> = messReceive;
  delete msgInChat.sender;
  return msgInChat as IMessageInChat;
}
