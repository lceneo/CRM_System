import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(
    private httpClient: HttpClient
  ) {}

  public get<T>(method: string) {
    return this.httpClient.get<T>(`/api${method}`);
  }

  public post<T>(method: string, body: any, options?: { headers: HttpHeaders | {[p: string] : string} }) {
    return this.httpClient.post<T>(`/api${method}`, body, options);
  }

  public put(method: string, body: any, options?: { headers: HttpHeaders | {[p: string] : string} }) {
    return this.httpClient.put(`/api${method}`, body, options);
  }

  public patch(method: string, body: any, options?: { headers: HttpHeaders | {[p: string] : string} }) {
    return this.httpClient.patch(`/api${method}`, body, options);
  }

  public delete(method: string, options?: { headers: HttpHeaders | {[p: string] : string} }) {
    return this.httpClient.delete(`/api${method}`, options);
  }

}
