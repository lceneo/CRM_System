import {AccountRole} from "../../enums/AccountRole";

export interface IProfileResponseDTO{
  id: string;
  surname: string;
  name: string;
  patronimic: string;
  about: string;
  role: AccountRole;
}
