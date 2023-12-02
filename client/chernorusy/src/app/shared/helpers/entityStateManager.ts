import {computed, inject, Injectable, signal, WritableSignal} from "@angular/core";
import {IEntityState} from "../models/states/EntityState";
import {HttpService} from "../services/http.service";
import {catchError, tap, throwError} from "rxjs";

@Injectable({providedIn: "any"})
export class EntityStateManager<T> {

  protected initMethod: string = '';

  protected entityState: WritableSignal<IEntityState<T>> = signal({
    entities: [],
    loaded: false,
    error: null
  });

  private httpS = inject(HttpService);
  constructor() {}

  protected initStore() {
    this.httpS.get<T[]>(this.initMethod)
      .pipe(
        tap(entities => {
          this.entityState.set({
            entities: entities,
            loaded: true,
            error: null
          })
        }),
        catchError((err) => {
          this.entityState.set({
            entities: [],
            loaded: false,
            error: new Error(err)
          });
          return throwError(() => new Error());
        })
      )
      .subscribe();
  }
  public upsertEntities(entities: T[]) {
    this.entityState.set(
      {...this.entityState(), entities: [...this.entityState().entities, ...entities]}
    );
  }

  public updateState(state: Partial<IEntityState<T>>) {
    this.entityState.set({...this.entityState(), ...state});
  }

  public getEntitiesSync() {
    return this.entityState().entities;
  }

  public getEntitiesAsync() {
    return computed(() => this.entityState().entities);
  }
}
