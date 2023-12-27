import {FileType} from "../../entities/FileType";

export interface ISendMessageRequest {
  recipientId: string;
  message?: string;
  fileUrl?: string;
  fileType?: FileType;
  requestNumber: number;
}
