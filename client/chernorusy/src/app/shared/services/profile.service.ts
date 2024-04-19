import {computed, Injectable, signal} from '@angular/core';
import {HttpService} from "./http.service";
import {IProfileCreateRequestDTO} from "../../modules/profile/DTO/request/ProfileCreateRequestDTO";
import {catchError, Observable, of, switchMap, tap, throwError} from "rxjs";
import {AuthorizationService} from "./authorization.service";
import {IProfileState} from "../models/states/ProfileState";
import {IProfileResponseDTO} from "../../modules/profile/DTO/response/ProfileResponseDTO";
import {AccountRole} from "../../modules/profile/enums/AccountRole";


@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(
    private httpS: HttpService
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
        catchError(err => {
            this.state.set({profile: null, loaded: true, error: err});
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

  public getProfiles$(params?: ProfilesGetParams) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.keys(params)
        .filter((paramKey) => params[paramKey as keyof ProfilesGetParams] !== null && params[paramKey as keyof ProfilesGetParams] !== undefined)
        .forEach(paramKey => {
          if (paramKey === 'Ids') {
            params[paramKey]?.forEach(id => searchParams.append(paramKey, id));
          } else {
            searchParams.set(paramKey, JSON.stringify(params[paramKey as keyof ProfilesGetParams]));
          }
        })
    }
    const searchString = searchParams.toString();
    const url = '/Profiles' + (searchString.length ? `?${searchString}` : '');
    return this.httpS.get<{totalCount: number, items: IProfileResponseDTO[]}>(url)
      .pipe(
        catchError(err => of({totalCount: 0, items: [] as IProfileResponseDTO[]}))
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


export interface ProfilesGetParams {
  Skip?: number;
  Take?: number;
  Role?: AccountRole;
  Ids?: string[];
}
