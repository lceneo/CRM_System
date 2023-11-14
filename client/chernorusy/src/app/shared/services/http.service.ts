import {Injectable, isDevMode} from '@angular/core';
import {HttpClient, HttpHeaders } from "@angular/common/http";
import {config} from "../../../main";



@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private url = config.apiUrl;
  private protocol = config.protocol;
  constructor(
    private httpClient: HttpClient
  ) {}

  public get<T>(method: string) {
    return this.httpClient.get<T>(`${this.protocol}://${this.url}/api${method}`);
  }

  public post<T>(method: string, body: any, options?: { headers: HttpHeaders | {[p: string] : string} }) {
    return this.httpClient.post<T>(`${this.protocol}://${this.url}/api${method}`, body, options);
  }

  public put(method: string, body: any, options?: { headers: HttpHeaders | {[p: string] : string} }) {
    return this.httpClient.put(`${this.protocol}://${this.url}/api${method}`, body, options);
  }

  public patch(method: string, body: any, options?: { headers: HttpHeaders | {[p: string] : string} }) {
    return this.httpClient.patch(`${this.protocol}://${this.url}/api${method}`, body, options);
  }

  public delete(method: string, options?: { headers: HttpHeaders | {[p: string] : string} }) {
    return this.httpClient.delete(`${this.protocol}://${this.url}/api${method}`, options);
  }

}
