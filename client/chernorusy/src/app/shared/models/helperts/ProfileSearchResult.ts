import {IProfileResponseDTO} from "../DTO/response/ProfileResponseDTO";

export interface IProfileSearchResult {
  profile: IProfileResponseDTO | null;
  canBeCreated: boolean;
}
