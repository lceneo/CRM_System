import {computed, inject, Injectable, signal, WritableSignal} from "@angular/core";
import {IEntityState} from "../models/states/EntityState";
import {HttpService} from "../services/http.service";
import {catchError, tap, throwError} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SocketService} from "../services/socket.service";

@Injectable({providedIn: "any"})
export class EntityStateManager<T> {

  protected initMethod: string = '';

  protected entityState: WritableSignal<IEntityState<T>> = signal({
    entities: [],
    loaded: false,
    error: null
  });

  protected httpS = inject(HttpService);
  protected socketS = inject(SocketService);
  constructor() {
    if (this.socketS.isConnected()) { this.initial(); }

    this.socketS.connected$
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe(() => this.initial());
  }

  protected initial() {
    //@ts-ignore
    throw Error(`initial fn for ${this.__proto__.constructor.name} is not implemented`);
  }


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
