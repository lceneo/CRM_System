import {computed, Injectable, signal} from '@angular/core';
import {HttpService} from "./http.service";
import {IProfileCreateRequestDTO} from "../models/DTO/request/ProfileCreateRequestDTO";
import {IProfileResponseDTO} from "../models/DTO/response/ProfileResponseDTO";
import {IProfileState} from "../models/states/ProfileState";
import {catchError, of, tap, throwError} from "rxjs";
import {AuthorizationService} from "./authorization.service";

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
        tap((profile) => this.authS.initialAuthentication(true, profile.role)),
        catchError(err => {
            this.state.set({profile: null, loaded: true, error: err});
          if (err.status === 401) { this.authS.initialAuthentication(false); }
          else if (err.status === 404) { this.authS.initialAuthentication(true); }
          return of(null);
        })
      ).subscribe(profile => this.state.set({profile: profile, loaded: true, error: null}));
  }

  public updateProfile() {
      this.httpS.get<IProfileResponseDTO>('/Profiles/My')
          .pipe(
              catchError(err => of(null))
          )
          .subscribe((profile) => this.state.set({profile: profile, loaded: true, error: null}));
  }

  create$(profileInfo: IProfileCreateRequestDTO) {
    return this.httpS.post('/Profiles', profileInfo);
  }
}
