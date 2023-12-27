import {IProfileOutShort} from "../../entities/ProfileOutShort";
import {ChatStatus} from "../../enums/ChatStatus";

export interface IChatResponseDTO {
  id: string;
  name: string;
  lastMessage: {
    id: string;
    sender: IProfileOutShort,
    message?: string;
    fileUrl?: string;
    dateTime: string;
  },
  status: ChatStatus
}
