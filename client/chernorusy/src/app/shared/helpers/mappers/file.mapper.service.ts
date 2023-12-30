import { Injectable } from '@angular/core';
import {IFileInMessageResponse} from "../../models/entities/FileInMessageResponse";
import {IFileInMessage} from "../../models/entities/FileInMessage";
import {HttpService} from "../../services/http.service";
import {map, Observable, switchMap} from "rxjs";
import mime from 'mime';

@Injectable({
  providedIn: 'root'
})
export class FileMapperService {

  constructor(
    private httpS: HttpService
  ) { }

  public fileKeyToFileInMessage$(fileKeyObj: IFileInMessageResponse): Observable<IFileInMessage> {
    return this.httpS.post<ArrayBuffer>('/Statics/Download', { fileKey: fileKeyObj.fileKey}, {responseType: 'arraybuffer'})
      .pipe(
        switchMap(arrBuffer =>
          this.blobFileToDataUrl$(
            new Blob([arrBuffer],
              {type: mime.getType(fileKeyObj.fileName) ?? 'text/plain'}))),
        map(dataUrl => ({
          fileName: fileKeyObj.fileName,
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
