import {ActiveStatus} from "../enums/ActiveStatus";

export interface IUserConnectionStatus {
  userId: string;
  status: ActiveStatus;
}
