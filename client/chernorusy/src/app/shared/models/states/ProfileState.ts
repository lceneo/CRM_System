import {IProfileResponseDTO} from "../DTO/response/ProfileResponseDTO";

export interface IProfileState{
  profile: IProfileResponseDTO | null;
  loaded: boolean;
  error: Error | null;
}
