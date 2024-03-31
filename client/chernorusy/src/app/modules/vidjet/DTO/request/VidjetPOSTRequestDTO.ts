import {Customization} from "../../services/vidjet.service";

export interface IVidjetPOSTRequestDTO {
  id?: string;
  domen: string;
  styles: Customization;
}
