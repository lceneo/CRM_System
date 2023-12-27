import { Injectable } from '@angular/core';
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FileMapperService {
  public fileToDataURL(file: File): Observable<string> {
   return new Observable(subscriber => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onloadend = (ev: ProgressEvent<FileReader>) => {
        subscriber.next(fileReader.result as string);
        subscriber.complete();
      }
    });
  }
 }
