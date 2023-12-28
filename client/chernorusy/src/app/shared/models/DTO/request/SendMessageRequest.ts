import {FileType} from "../../entities/FileType";

export interface ISendMessageRequest {
  recipientId: string;
  message?: string;
  fileName?: string;
  requestNumber: number;
}
