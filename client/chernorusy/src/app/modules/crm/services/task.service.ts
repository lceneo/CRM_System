import {inject, Injectable} from '@angular/core';
import {EntityStateManager} from "../../../shared/helpers/entityStateManager";
import {ITask} from "../helpers/entities/ITask";
import {CrmHubService} from "./crm-hub.service";
import {map, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TaskService extends EntityStateManager<ITask>{

  constructor() {
    super();
    this.initial();
  }

  protected crmSocketS = inject(CrmHubService);

  protected override initMethod = '/Crm/Tasks/Search';
  override httpInitMethod: 'get' | 'post' = 'post';
  override httpInitBody = {};
  override mapFn = (tasksItems: {items: ITask[]}) => tasksItems.items;

  protected override initial() {
    this.initStore();
    this.registrateSocketHandlers();
  }

  updateHTTP$(updatedTask: Partial<ITask> & {id: string}) {
    return this.httpS.post('/Crm/Tasks', updatedTask)
        .pipe(
            tap(() => this.updateByID(updatedTask.id, updatedTask))
        );
  }

  getByIDHttp$(taskID: string) {
    return this.httpS.post<{items: ITask[]}>(this.initMethod, { ids: [taskID]})
        .pipe(
            map(res => this.mapFn(res)[0])
        );
  }

  deleteByIDHTTP$(taskID: string) {
    return this.httpS.delete(`/Crm/Tasks/${taskID}`)
        .pipe(
            tap(res => this.removeByID(taskID))
        );
  }

  private registrateSocketHandlers() {
    const updateTaskHandler = (updatedTask: IUpdatedTaskMsg) => {
      if (!updatedTask.taskId) { this.initStore(); }
      else {
        this.getByIDHttp$(updatedTask.taskId)
            .pipe(
                tap(updatedTask => this.updateByID(updatedTask.id, updatedTask))
            ).subscribe();
      }
    }

    this.crmSocketS.listenMethod('Changes', updateTaskHandler);
  }
}

interface IUpdatedTaskMsg {
  taskId?: string;
}
