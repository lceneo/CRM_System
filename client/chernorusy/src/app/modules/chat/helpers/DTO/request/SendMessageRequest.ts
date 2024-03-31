import {FileType} from "../../entities/FileType";

export interface ISendMessageRequest {
  recipientId: string;
  message?: string;
  fileKeys?: string[];
  requestNumber: number;
}
