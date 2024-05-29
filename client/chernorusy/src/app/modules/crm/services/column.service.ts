import {computed, Injectable} from '@angular/core';
import {EntityStateManager} from "../../../shared/helpers/entityStateManager";
import {IColumn} from "../helpers/entities/IColumn";
import {filter, map, switchMap, take, tap} from "rxjs";
import {ICreateOrUpdateEntityDTO} from "../../../shared/helpers/DTO/response/ICreateOrUpdateEntityDTO";
import {IColumnCreateOrUpdateDTO} from "../helpers/DTO/request/IColumnCreateOrUpdateDTO";
import {TaskService} from "./task.service";

@Injectable({
  providedIn: 'root'
})
export class ColumnService extends EntityStateManager<IColumn>{

  constructor() {
    super();
    this.initial();
  }

  protected override initMethod = '/Crm/Tasks/Columns/Search';
  override httpInitMethod: 'get' | 'post' = 'post';
  override httpInitBody = {};

  override mapFn = (columnItems: {items: IColumn[]}): IColumn[] => columnItems.items
    .map(column => ({...column, color: column.color || '#ecf0f3'}));


  protected override initial() {
    this.initStore();
    // this.registrateSocketHandlers();
  }

  createHTTP$(column: Omit<IColumnCreateOrUpdateDTO, 'id'>) {
    return this.httpS.post<{id: string}>('/Crm/Tasks/Columns', column)
      .pipe(
        switchMap((res) => this.getByIDHttp$(res.id)),
        tap((column) => {
          this.upsertEntities([column]);
        })
      );
  }

  updateHTTP$(updatedColumn: Partial<IColumnCreateOrUpdateDTO>) {
    return this.httpS.post<ICreateOrUpdateEntityDTO>('/Crm/Tasks/Columns', updatedColumn)
      .pipe(
        switchMap((res) => this.getByIDHttp$(res.id)),
        tap((updatedColumn) => this.updateByID(updatedColumn.id, updatedColumn))
      );
  }

  deleteByIDHTTP$(columnID: string) {
    return this.httpS.delete(`/Crm/Tasks/Columns/${columnID}`)
      .pipe(
        tap(res => {
          this.removeByID(columnID);
        })
      );
  }

  getByIDHttp$(columnID: string) {
    return this.httpS.post<{items: IColumn[]}>(this.initMethod, { ids: [columnID]})
      .pipe(
        map(res => this.mapFn(res)[0])
      );
  }

  getEntitiesSortedAsync() {
    return computed(() => this.getEntitiesAsync()()
      .sort((f, s) => f.order - s.order))
  }
}
