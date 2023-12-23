import {computed, DestroyRef, inject, Injectable, signal, WritableSignal} from "@angular/core";
import {IEntityState} from "../models/states/EntityState";
import {HttpService} from "../services/http.service";
import {catchError, map, tap, throwError} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SocketService} from "../services/socket.service";
import {IChatResponseDTO} from "../models/DTO/response/ChatResponseDTO";

@Injectable({providedIn: "any"})
export class EntityStateManager<T extends {id: string}> {

  protected initMethod: string = '';
  protected mapFn?: Function;

  protected entityState: WritableSignal<IEntityState<T>> = signal({
    entities: [],
    loaded: false,
    error: null
  });


  protected httpS = inject(HttpService);
  protected socketS = inject(SocketService);
  private destroyRef = inject(DestroyRef);
  constructor() {
    setTimeout(() => {
        if (this.socketS.isConnected()) {
          this.initial();
        }

        this.socketS.connected$
          .pipe(
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe(() => this.initial());
      }
    );
  }

  protected initial() {
    //@ts-ignore
    throw Error(`initial fn for ${this.__proto__.constructor.name} is not implemented`);
  }


  protected initStore() {
    this.httpS.get<T[]>(this.initMethod)
      .pipe(
        map((entities) => this.mapFn ? this.mapFn(entities) : entities),
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

  public updateByID(id: string, updatedEntity: Partial<T>) {
    const existingEntity = this.getEntitiesSync().find(chat => chat.id === id);
    if (!existingEntity) {
      return;
    }
    this.updateState({
      entities: [
        ...this.getEntitiesSync().filter(chat => chat.id !== existingEntity.id),
        {...existingEntity, ...updatedEntity}]
    });
  }

  protected removeByID(id: string) {
    this.updateState({
      ...this.entityState,
      entities: this.getEntitiesSync().filter(entity => entity.id !== id) });
  }

  public getByID(id: string) {
    return this.entityState().entities.find(entity => entity.id === id);
  }

  public getEntitiesSync() {
    return this.entityState().entities;
  }

  public getEntitiesAsync() {
    return computed(() => this.entityState().entities);
  }

  protected sortByPredicate(sortFn: (f: T, s: T) => number) {
    this.updateState({
      ...this.entityState,
      entities: this.entityState().entities.sort(sortFn)
    });
  }
}
