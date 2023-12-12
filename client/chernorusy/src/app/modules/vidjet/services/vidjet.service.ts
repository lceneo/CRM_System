import { Injectable } from '@angular/core';
import {EntityStateManager} from "../../../shared/helpers/entityStateManager";
import {IVidjet} from "../../../shared/models/entities/Vidjet";
import {IVidjetPOSTResponseDTO} from "../../../shared/models/DTO/response/VidjetPOSTResponseDTO";
import {IVidjetPOSTRequestDTO} from "../../../shared/models/DTO/request/VidjetPOSTRequestDTO";
import {tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class VidjetService extends EntityStateManager<IVidjet> {

  protected override initMethod = '/Vidjets';
  protected override mapFn = (res: {items: IVidjet[]}) => res.items;
  constructor() {
    super();
  }

  protected override initial() {
    this.initStore();
  }


  public createOrUpdateVidjet(vidjet: IVidjetPOSTRequestDTO) {
    return this.httpS.post<IVidjetPOSTResponseDTO>('/Vidjets', vidjet)
      .pipe(
        tap((res) => {
          'id' in vidjet ? this.updateByID(vidjet.id as string, {domen: vidjet.domen})
              //@ts-ignore
            : this.upsertEntities([{...vidjet, id: res.id}]);
        })
      )
  }

  public deleteVidjet(id: string) {
    return this.httpS.delete(`/Vidjets/${id}`)
      .pipe(
        tap(() => this.removeByID(id))
      );
  }

}
