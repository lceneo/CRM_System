import {IProfileResponseDTO} from "../../../modules/profile/DTO/response/ProfileResponseDTO";

export interface IProfileState{
  profile: IProfileResponseDTO | null;
  loaded: boolean;
  error: Error | null;
}
