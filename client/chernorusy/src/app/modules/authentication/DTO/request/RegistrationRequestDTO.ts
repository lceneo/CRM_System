import {AccountRole} from "../../../profile/enums/AccountRole";

export interface IRegistrationRequestDTO {
  login: string;
  email: string;
  role?: AccountRole;
}
