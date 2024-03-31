import { Injectable } from '@angular/core';
import {HttpService} from "./http.service";
import {IFilePOSTResponseDTO} from "../../modules/chat/helpers/DTO/response/FilePOSTResponseDTO";

@Injectable({
  providedIn: 'root'
})
export class StaticService {

  constructor(private httpS: HttpService) { }

  public uploadFile$(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpS.post<IFilePOSTResponseDTO>('/Statics/Upload', formData);
  }
}
