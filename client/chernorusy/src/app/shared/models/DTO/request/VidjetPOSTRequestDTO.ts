import {Customization} from "../../../../modules/vidjet/services/vidjet.service";

export interface IVidjetPOSTRequestDTO {
  id?: string;
  domen: string;
  styles: Customization;
}
