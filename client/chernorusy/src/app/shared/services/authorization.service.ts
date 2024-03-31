import {Injectable} from '@angular/core';
import {HttpService} from "./http.service";
import {BehaviorSubject, catchError, of, tap} from "rxjs";
import {ILoginResponseDTO} from "../../modules/authentication/DTO/response/LoginResponseDTO";
import {ILoginRequestDTO} from "../../modules/authentication/DTO/request/LoginRequestDTO";
import {IRegistrationRequestDTO} from "../../modules/authentication/DTO/request/RegistrationRequestDTO";
import {ICreatePasswordRequestDTO} from "../../modules/authentication/DTO/request/CreatePasswordRequestDTO";
import {IChangePasswordRequestDTO} from "../../modules/authentication/DTO/request/ChangePasswordRequstDTO";
import {IRecoverPasswordRequestDTO} from "../../modules/authentication/DTO/request/RecoverPasswordRequestDTO";
import {AccountRole} from "../../modules/profile/enums/AccountRole";
import {SocketService} from "./socket.service";
import {CustomErrorHandlerService} from "./custom-error-handler.service";

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {

  constructor(
    private httpS: HttpService,
    private socketS: SocketService,
    private errorHandlerS: CustomErrorHandlerService
  ) {
    setTimeout(() => this.initAccountInfo());
    this._token = localStorage.getItem('jwtToken') ?? undefined;
  }

  private _role = new BehaviorSubject<AccountRole | null>(null);
  private _isAdmin$= new BehaviorSubject<boolean | null>(null);
  private _authorizationStatus = new BehaviorSubject<boolean | null>(null);

  public isAdmin$ = this._isAdmin$.asObservable();
  public role$ = this._role.asObservable();
  public authorizationStatus = this._authorizationStatus.asObservable();
  private _userID?: string;
  private _token?: string;

  set token(value: string) {
    this._token = value;
    if (value) { localStorage.setItem('jwtToken', value); }
  }

  get userID(): string | undefined {
    return this._userID;
  }

  set userID(value: string | undefined) {
    this._userID = value;
    if (value) { localStorage.setItem('userID', value); }
  }

  public initialAuthentication(success: boolean, userData?: Partial<ILoginResponseDTO>) {
    if (success) {
      this._authorizationStatus.next(true);
      this._isAdmin$.next(userData ? userData.role === AccountRole.Admin : false);
      if (userData) { this._role.next(userData.role as number); }
      if (!this.socketS.isConnected()) { this.socketS.init(); }
    } else {
      this._authorizationStatus.next(false);
      this._isAdmin$.next(false);
    }
  }

  public login$(credentials: ILoginRequestDTO) {
    return this.httpS.post<ILoginResponseDTO>('/Accounts/Login', credentials)
      .pipe(
        tap(loginResponse => {
          this._authorizationStatus.next(true);
          this._isAdmin$.next(loginResponse.role === AccountRole.Admin);
          this._role.next(loginResponse.role);
          this.userID = loginResponse.id;
          this.token = loginResponse.jwtToken;
          if (!this.socketS.isConnected()) { this.socketS.init(); }
        }),
        catchError(err => {
          this.errorHandlerS.handleError(err);
          return of(false);
        })
      );
  }

  public logout$(fromResponse: boolean = false) {
    this.socketS.stopConnection();
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
          this.userID = undefined;
          localStorage.removeItem('userID')
        })
      );
  }

  public registrate$(credentials: IRegistrationRequestDTO, mode: 'admin' | 'user') {
    return mode === 'admin' ? this.httpS.post('/Accounts/Register/Admin', credentials)
      : this.httpS.post('/Accounts/Register', credentials);
  }

  public createPassword(id: string, password: ICreatePasswordRequestDTO) {
    return this.httpS.post<ILoginResponseDTO>(`/Accounts/Password/${id}`, password)
      .pipe(
        tap((loginResponse) => {
          this._authorizationStatus.next(true);
          this._isAdmin$.next(loginResponse?.role === AccountRole.Admin);
          this._role.next(loginResponse.role);
          this.userID = loginResponse.id;
          this.token = loginResponse.jwtToken;
          if (!this.socketS.isConnected()) { this.socketS.init(); }
        })
      )
  }

  public changePassword(password: IChangePasswordRequestDTO) {
    return this.httpS.post('/Accounts/Password/Change', password);
  }

  public recoverPassword(credentials: IRecoverPasswordRequestDTO) {
    return this.httpS.post('/Accounts/Password/Recover', credentials);
  }

  public recoverPasswordToUser(recoverID: string, newPassword: ICreatePasswordRequestDTO) {
    return this.httpS.post(`/Accounts/Password/Recover/${recoverID}`, newPassword);
  }

  private initAccountInfo() {
    this.httpS.get<Partial<ILoginResponseDTO>>('/Accounts/My')
      .subscribe(
        res => {
          this.userID = res.id;
          this._role.next(res.role as number);
          this._isAdmin$.next(res.role === AccountRole.Admin);
          this._authorizationStatus.next(true);
          if (!this.socketS.isConnected()) { this.socketS.init(); }
        }
      )
  }
}
