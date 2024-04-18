import {computed, inject, Injectable} from '@angular/core';
import {EntityStateManager} from "../../../shared/helpers/entityStateManager";
import {ITask} from "../helpers/entities/ITask";
import {CrmHubService} from "./crm-hub.service";
import {map, switchMap, tap} from "rxjs";
import {ITaskCreateOrUpdateDTO} from "../helpers/DTO/request/ITaskCreateOrUpdateDTO";
import {ICommentPostDTO} from "../helpers/DTO/request/ICommentPostDTO";
import {ICreateOrUpdateEntityDTO} from "../../../shared/helpers/DTO/response/ICreateOrUpdateEntityDTO";
import {IComment} from "../helpers/entities/IComment";

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

  createHTTP$(task: Omit<ITaskCreateOrUpdateDTO, 'productIds'>) {
    return this.httpS.post<ICreateOrUpdateEntityDTO>('/Crm/Tasks', task)
      .pipe(
        switchMap((res) => this.getByIDHttp$(res.id)),
        tap((task) => this.upsertEntities([task]))
      );
  }

  updateHTTP$(updatedTask: Partial<ITaskCreateOrUpdateDTO>) {
    return this.httpS.post<ICreateOrUpdateEntityDTO>('/Crm/Tasks', updatedTask)
        .pipe(
            switchMap((res) => this.getByIDHttp$(res.id)),
            tap((updatedTask) => this.updateByID(updatedTask.id, updatedTask))
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

  postComment$(taskID: string, comment: ICommentPostDTO) {
    return this.httpS.post<ICreateOrUpdateEntityDTO>(`/Crm/Tasks/${taskID}/Comments`, comment)
        .pipe(
          switchMap(res => this.getCommentFromTaskHTTP$(taskID, res.id)),
          tap(createdComment => this.addComment(taskID, createdComment))
        );
  }

  updateComment$(taskID: string, comment: ICommentPostDTO) {
      return this.httpS.post<ICreateOrUpdateEntityDTO>(`/Crm/Tasks/${taskID}/Comments`, comment)
          .pipe(
            switchMap(res => this.getCommentFromTaskHTTP$(taskID, res.id)),
            tap(createdComment => this.updateComment(taskID, createdComment))
      );
  }

  getCommentFromTaskHTTP$(taskID: string, commentID: string) {
    return this.getByIDHttp$(taskID)
        .pipe(
            map(task => task.comments.find(comm => comm.id === commentID) as IComment)
        );
  }

  getTaskCommentsAsync(taskID: string) {
    return computed(() => this.getEntityAsync(taskID)()?.comments);
  }
  getTaskCommentsSync(taskID: string) {
    return this.getByID(taskID)?.comments ?? [];
  }
  addComment(taskID: string, comment: IComment) {
    const currentComments = this.getTaskCommentsSync(taskID);
    this.updateByID(taskID, { comments: [...currentComments, comment]});
  }

  updateComment(taskID: string, comment: IComment) {
    const currentComments = this.getTaskCommentsSync(taskID).filter(comm => comm.id !== comment.id);
    this.updateByID(taskID, { comments: [...currentComments, comment]});
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
