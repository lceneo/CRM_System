import { Injectable } from '@angular/core';
import {HttpService} from "./http.service";
import {BehaviorSubject, catchError, Observable, of, tap} from "rxjs";
import {ILoginResponseDTO} from "../models/DTO/response/LoginResponseDTO";
import {ILoginRequestDTO} from "../models/DTO/request/LoginRequestDTO";
import {IRegistrationRequestDTO} from "../models/DTO/request/RegistrationRequestDTO";
import {IPasswordRequestDTO} from "../models/DTO/request/PasswordRequestDTO";

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {

  constructor(
    private httpS: HttpService
  ) { }

  private _isAdmin$= new BehaviorSubject<boolean | null>(null);
  private _authorizationStatus = new BehaviorSubject<boolean | null>(null);

  public isAdmin$ = this._isAdmin$.asObservable();
  public authorizationStatus = this._authorizationStatus.asObservable();
  public login$(credentials: ILoginRequestDTO) {
    return this.httpS.post<ILoginResponseDTO>('/Accounts/Login', credentials)
      .pipe(
        tap(roleObj => {
          this._authorizationStatus.next(true);
          this._isAdmin$.next(roleObj.role === 0);
        }),
        catchError(err => of(false))
      );
  }

  public logout$(fromResponse: boolean = false) {
    if (fromResponse) {
      this._authorizationStatus.next(false);
      this._isAdmin$.next(false);
      return of();
    }
    return this.httpS.post('/Accounts/Logout', {})
      .pipe(
        tap(roleObj => {
          this._authorizationStatus.next(false);
          this._isAdmin$.next(false);
        })
      );
  }

  public registrate$(credentials: IRegistrationRequestDTO) {
    return this.httpS.post('/Accounts/Register', credentials);
  }

  public createPassword(id: string, password: IPasswordRequestDTO) {
    return this.httpS.post(`/Accounts/Password/${id}`, password);
  }
}
