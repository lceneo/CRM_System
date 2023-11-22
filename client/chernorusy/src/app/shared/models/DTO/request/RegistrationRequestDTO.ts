import {AccountRole} from "../../enums/AccountRole";

export interface IRegistrationRequestDTO {
  login: string;
  email: string;
  role: AccountRole;
}
