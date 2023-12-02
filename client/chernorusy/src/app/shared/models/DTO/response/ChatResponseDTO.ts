import {IProfileOutShort} from "../../entities/ProfileOutShort";

export interface IChatResponseDTO {
  id: string;
  name: string;
  lastMessage: {
    id: string;
    sender: IProfileOutShort,
    message: string;
    dateTime: string;
  }
}
