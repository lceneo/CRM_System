import {IMessageInChat} from "../../entities/MessageInChat";

export interface IMessageInChatResponseDTO {
  items: IMessageInChat[];
  totalCount: number;
}
