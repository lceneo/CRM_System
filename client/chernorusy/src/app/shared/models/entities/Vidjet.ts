import {Customization} from "../../../modules/vidjet/services/vidjet.service";

export interface IVidjet {
  id: string;
  userId?: string;
  domen: string;
  styles: Customization;
}
