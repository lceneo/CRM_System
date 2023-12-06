import {computed, Injectable, signal} from '@angular/core';
import {HttpService} from "./http.service";
import {IProfileCreateRequestDTO} from "../models/DTO/request/ProfileCreateRequestDTO";
import {catchError, of, switchMap, tap, throwError} from "rxjs";
import {AuthorizationService} from "./authorization.service";
import {IProfileState} from "../models/states/ProfileState";
import {IProfileResponseDTO} from "../models/DTO/response/ProfileResponseDTO";


@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(
    private httpS: HttpService,
    private authS: AuthorizationService
  ) { }

  private state = signal<IProfileState>({
    profile: null,
    loaded: false,
    error: null
  });

  public profile = computed(() => this.state().profile);

  public determineInitialState() {
    this.httpS.get<IProfileResponseDTO>('/Profiles/My')
      .pipe(
        tap((profile) => this.authS.initialAuthentication(true, {role: profile.role, id: profile.id})),
        catchError(err => {
            this.state.set({profile: null, loaded: true, error: err});
          if (err.status === 401) { this.authS.initialAuthentication(false); }
          else if (err.status === 404) { this.authS.initialAuthentication(true); }
          return of(null);
        })
      ).subscribe(profile => this.state.set({profile: profile, loaded: true, error: null}));
  }

  public updateProfileByHTTP() {
      return this.httpS.get<IProfileResponseDTO>('/Profiles/My')
          .pipe(
              tap((profile) => this.state.set({profile: profile, loaded: true, error: null})),
              catchError(err => of(null))
          );
  }

  public getProfile$(id: string) {
    return this.httpS.get<IProfileResponseDTO>(`/Profiles/${id}`)
      .pipe(
        catchError(err => of(null))
      );
  }

  public getProfiles$() {
    return this.httpS.get<{items: IProfileResponseDTO[]}>(`/Profiles`)
      .pipe(
        catchError(err => of(null))
      );
  }

  public signOut() {
    this.state.set({profile: null, loaded: false, error: null});
  }

  createOrUpdate$(profileInfo: IProfileCreateRequestDTO) {
    return this.httpS.post('/Profiles', profileInfo)
      .pipe(
        switchMap(() => this.updateProfileByHTTP())
      )
  }
}
