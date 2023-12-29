import {IProfileOutShort} from "../../entities/ProfileOutShort";
import {ChatStatus} from "../../enums/ChatStatus";
import {IFileInMessage} from "../../entities/FileInMessage";

export interface IChatResponseDTO {
  id: string;
  name: string;
  lastMessage: {
    id: string;
    sender: IProfileOutShort,
    message?: string;
    files: IFileInMessage[];
    dateTime: string;
  },
  status: ChatStatus
}
