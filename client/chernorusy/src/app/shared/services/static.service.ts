import { Injectable } from '@angular/core';
import {HttpService} from "./http.service";
import {IFilePOSTResponseDTO} from "../models/DTO/response/FilePOSTResponseDTO";
import {defer, from, Observable, switchMap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StaticService {

  constructor(private httpS: HttpService) { }

  public uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpS.post<IFilePOSTResponseDTO>('/Statics/Upload', formData);
  }
}
