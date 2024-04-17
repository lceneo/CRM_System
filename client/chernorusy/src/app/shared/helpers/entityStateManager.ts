import {computed, DestroyRef, inject, Injectable, signal, WritableSignal} from "@angular/core";
import {IEntityState} from "../models/states/EntityState";
import {HttpService} from "../services/http.service";
import {catchError, map, Observable, tap, throwError} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ChatHubService} from "../../modules/chat/services/chat-hub.service";
import {IChatResponseDTO} from "../../modules/chat/helpers/entities/ChatResponseDTO";

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
  protected destroyRef = inject(DestroyRef);

  protected httpInitMethod: 'get' | 'post' = 'get';
  protected httpInitBody?: any
  constructor() {}

  protected initial() {
    //@ts-ignore
    throw Error(`initial fn for ${this.__proto__.constructor.name} is not implemented`);
  }


  protected initStore(fnCallback?: (...args: any[]) => any) {
    const httpReq = this.httpInitMethod === 'get' ?
        this.httpS.get<T[]>(this.initMethod) :
        this.httpS.post<T[]>(this.initMethod, this.httpInitBody);
    httpReq
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
      .subscribe(
        {
          complete: () => {
            fnCallback && fnCallback();
          }
        }
      );
  }
  public upsertEntities(entities: T[]) {
    const entitiesArr: T[] = [];
    entities.forEach(entity => {
      const existingEntity = this.getByID(entity.id);
      if (existingEntity) { entitiesArr.push({...existingEntity, ...entity}); }
      else { entitiesArr.push(entity); }
    })
    this.entityState.set(
      {...this.entityState(),
        entities: [...this.entityState().entities.filter(existing => !entities.some(ent => ent.id === existing.id)),
          ...entitiesArr]}
    );
  }

  public updateState(state: Partial<IEntityState<T>>) {
    this.entityState.set({...this.entityState(), ...state});
  }

  public updateByID(id: string, updatedEntity: Partial<T>) {
    const existingEntity = this.getEntitiesSync().find(entity => entity.id === id);
    if (!existingEntity) {
      return;
    }
    this.updateState({
      entities: [
        ...this.getEntitiesSync().filter(chat => chat.id !== existingEntity.id),
        {...existingEntity, ...updatedEntity}]
    });
  }

  public removeByID(id: string) {
    this.updateState({
      ...this.entityState,
      entities: this.getEntitiesSync().filter(entity => entity.id !== id) });
  }

  public getByID(id: string) {
    return this.entityState().entities.find(entity => entity.id === id);
  }

  public getByIDAsync(id: string) {
    return computed(() => this.entityState().entities.find(entity => entity.id === id));
  }

  public getEntitiesSync() {
    return this.entityState().entities;
  }

  getEntityAsync(id: string) {
    return computed(() => this.entityState().entities.find(entity => entity.id === id))
  }

  public getEntitiesAsync(filterFn?: (item: T) => boolean) {
    return computed(() => this.entityState().entities.filter(entity => filterFn ? filterFn(entity) : true));
  }
}
