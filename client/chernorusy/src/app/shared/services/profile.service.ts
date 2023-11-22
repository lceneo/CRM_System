import { Injectable } from '@angular/core';
import {HttpService} from "./http.service";
import {IProfileCreateRequestDTO} from "../models/DTO/request/ProfileCreateRequestDTO";

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(
    private httpS: HttpService
  ) { }

  create$(profileInfo: IProfileCreateRequestDTO) {
    return this.httpS.post('/Profiles', profileInfo);
  }
}
