import {IProfileOutShort} from "../../../profile/entities/ProfileOutShort";
import {ChatStatus} from "../enums/ChatStatus";
import {IFileInMessage} from "./FileInMessage";

export interface IChatResponseDTO {
  id: string;
  name: string;
  profiles: IProfileOutShort[],
  lastMessage: {
    id: string;
    sender: IProfileOutShort,
    message?: string;
    files: IFileInMessage[];
    dateTime: string;
  },
  status: ChatStatus
  unreadMessagesCount: number;
}
