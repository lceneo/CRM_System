import { Injectable } from '@angular/core';
import {IFileInMessage} from "../../../modules/chat/helpers/entities/FileInMessage";
import {HttpService} from "../../services/http.service";
import {map, Observable, switchMap} from "rxjs";
import mime from 'mime'

@Injectable({
  providedIn: 'root'
})
export class FileMapperService {

  constructor(
    private httpS: HttpService
  ) { }

  public fileResponseToFileInMessage$(fileKeyObj: Pick<IFileInMessage, 'fileKey' | 'fileName'>): Observable<IFileInMessage> {
    return this.httpS.post<ArrayBuffer>('/Statics/Download', { fileKey: fileKeyObj.fileKey}, {responseType: 'arraybuffer'})
      .pipe(
        switchMap(arrBuffer =>
          this.blobFileToDataUrl$(
            new Blob([arrBuffer],
              {type: mime.getType(fileKeyObj.fileName) ?? 'text/plain'}))),
        map(dataUrl => ({
          fileName: fileKeyObj.fileName,
          fileKey: fileKeyObj.fileKey,
          dataUrl: dataUrl,
          fileType: mime.getType(fileKeyObj.fileName) ?? 'text/plain'
        }))
      )
  }

  public blobFileToDataUrl$(blobFile: Blob) {
    return new Observable<string>(sub => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(blobFile);
      fileReader.onloadend = () => {
        sub.next(fileReader.result as string);
        sub.complete();
      }
    })
  }

}
