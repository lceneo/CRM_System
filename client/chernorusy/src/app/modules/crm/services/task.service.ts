import {computed, inject, Injectable} from '@angular/core';
import {EntityStateManager} from "../../../shared/helpers/entityStateManager";
import {ITask} from "../helpers/entities/ITask";
import {CrmHubService} from "./crm-hub.service";
import {map, switchMap, tap} from "rxjs";
import {ITaskCreateOrUpdateDTO} from "../helpers/DTO/request/ITaskCreateOrUpdateDTO";
import {ICommentPostDTO} from "../helpers/DTO/request/ICommentPostDTO";
import {ICreateOrUpdateEntityDTO} from "../../../shared/helpers/DTO/response/ICreateOrUpdateEntityDTO";
import {IComment} from "../helpers/entities/IComment";
import {TaskState} from "../helpers/enums/TaskState";
import {groupBy, max} from "lodash";

@Injectable({
  providedIn: 'root'
})
export class TaskService extends EntityStateManager<ITask>{

  constructor() {
    super();
    window.addEventListener('beforeunload', () => localStorage.setItem('tasksOrderByState', JSON.stringify(this.tasksOrderByState)))
    this.initial();
  }

  protected crmSocketS = inject(CrmHubService);
  protected override initMethod = '/Crm/Tasks/Search';
  private tasksOrderByState: TaskOrderByStateType = JSON.parse(localStorage.getItem('tasksOrderByState') ?? '{}');

  override httpInitMethod: 'get' | 'post' = 'post';
  override httpInitBody = {};
  override mapFn = (tasksItems: {items: ITask[]}) => tasksItems.items;

  protected override initial() {
    this.initStore((tasks: ITask[]) => {
      // если у нас нет сохранений в localStorage, то заполняем результатом get-запроса
      if(Object.keys(this.tasksOrderByState).length === 0) {
        this.setInitialTaskOrderState(tasks);
      }
    }
      );
    this.registrateSocketHandlers();
  }

  /**
   *
   * @param state - тип задач, для которых нужно вернуть очерёдность
   */
  getStateOrder(state: TaskState) {
    return this.tasksOrderByState[state];
  }

  /**
   *
   * @param state - тип задач, для которых хотим сменить порядок
   * @param newStateOrder - новый порядок задач
   */
  saveStateOrder(state: TaskState, newStateOrder: TaskOrderType) {
    // если нет сохранённого состояния по указаному статусу задачи, то создаём его
    if (!this.tasksOrderByState.hasOwnProperty(state)) {
      this.tasksOrderByState[state] = newStateOrder;
      return;
    }
    Object.keys(newStateOrder).forEach(taskID => {
      if (taskID === undefined) { console.log(taskID)}
      // сохраняем новый порядок задачи
      this.tasksOrderByState[state]![taskID] = newStateOrder[taskID];
    })
  }

  /**
   *
   * @param state - тип задач, из которых надо удалить задачу
   * @param taskIDToRemove - id задачи, которую надо удалить
   */
  removeFromStateOrder(state: TaskState, taskIDToRemove: string) {
    if (!this.tasksOrderByState[state] || !this.tasksOrderByState[state]!.hasOwnProperty(taskIDToRemove)) { return; }
    delete this.tasksOrderByState[state]![taskIDToRemove];
    this.updateIndexesInStateOrder(state);
  }

  swapTwoItemsInOneStateColumn(taskID: string, state: TaskState, newIndex: number, oldIndex: number) {
    const currentStateOrder = this.getStateOrder(state) || {};
    const taskIDToSwapWith = Object.keys(currentStateOrder).find(secondTaskID => currentStateOrder[secondTaskID] === newIndex) as string;
    if (taskIDToSwapWith) {
      this.saveStateOrder(state, {[taskID]: newIndex, [taskIDToSwapWith]: oldIndex});
    } else {
      this.saveStateOrder(state, {[taskID]: newIndex});
    }
  }

  switchStateInOrderState(taskID: string, oldState: TaskState, newState: TaskState, indexToPlaceIn?: number) {
    this.removeFromStateOrder(oldState, taskID);
    this.addToTaskOrderState(taskID, newState, indexToPlaceIn);
  }

  private setInitialTaskOrderState(tasks: ITask[]) {
    if (!tasks.length) { return; }
    const groupedTasks = groupBy(tasks, (task: ITask) => task.state);
    Object.keys(groupedTasks).forEach(taskState => {
      const stateOrder = groupedTasks[taskState].reduce((state,curr, i) => ({...state, [curr.id]: i}),{})
      this.saveStateOrder(+taskState, stateOrder);
    });
  }

  private addToTaskOrderState(taskID: string, state: TaskState, indexToPlaceIn?: number) {
    const currentStateOrder = this.getStateOrder(state) ?? {};
    let newTaskColumnIndex: number;
    if (indexToPlaceIn !== undefined) {
      newTaskColumnIndex = indexToPlaceIn;
      const tasksToAdjust = Object.keys(currentStateOrder)
        .filter(taskID => currentStateOrder[taskID] >= indexToPlaceIn)
        .reduce((prev, curr) => ({...prev, [curr]: currentStateOrder[curr] + 1}), {})
      this.saveStateOrder(state, {...tasksToAdjust, [taskID]: newTaskColumnIndex})
    }
    else {
      const currentMaxIndex = max(Object.values(currentStateOrder));
      newTaskColumnIndex = currentMaxIndex ? currentMaxIndex + 1 : 0;
      this.saveStateOrder(state, {...currentStateOrder, [taskID]: newTaskColumnIndex})
    }
  }

  private updateIndexesInStateOrder(stateToUpdate: TaskState) {
    const currentState = this.getStateOrder(stateToUpdate)!;
    Object.keys(currentState).sort((f, s) => currentState[f] - currentState[s])
      .forEach((taskID, i) => currentState[taskID] = i);
  }

  createHTTP$(task: Omit<ITaskCreateOrUpdateDTO, 'productIds'>) {
    return this.httpS.post<ICreateOrUpdateEntityDTO>('/Crm/Tasks', task)
      .pipe(
        switchMap((res) => this.getByIDHttp$(res.id)),
        tap((task) => {
          this.upsertEntities([task]);
          this.addToTaskOrderState(task.id, task.state);
        })
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
            tap(res => {
              const prevState = this.getByID(taskID);
              this.removeFromStateOrder(prevState!.state, taskID);
              this.removeByID(taskID);
            })
        );
  }

  postCommentHTTP$(taskID: string, comment: ICommentPostDTO) {
    return this.httpS.post<ICreateOrUpdateEntityDTO>(`/Crm/Tasks/${taskID}/Comments`, comment)
        .pipe(
          switchMap(res => this.getCommentFromTaskHTTP$(taskID, res.id)),
          tap(createdComment => this.addComment(taskID, createdComment))
        );
  }

  deleteCommentHTTP$(taskID: string, commentID: string) {
    return this.httpS.post(`/Crm/Tasks/${taskID}/Comments/${commentID}`)
      .pipe(
        tap(createdComment => this.deleteComment(taskID, commentID))
      );
  }

  updateCommentHTTP$(taskID: string, comment: ICommentPostDTO) {
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

  deleteComment(taskID: string, commentID: string) {
    const currentComments = this.getTaskCommentsSync(taskID);
    this.updateByID(taskID, { comments: currentComments.filter(comm => comm.id !== commentID)});
  }

  updateComment(taskID: string, comment: IComment) {
    const currentComments = this.getTaskCommentsSync(taskID).filter(comm => comm.id !== comment.id);
    this.updateByID(taskID, { comments: [...currentComments, comment]});
  }




  private registrateSocketHandlers() {

    const removeDeletedItemFromOrder = (tasks: ITask[]) => {
      const newTasksIDs = tasks.map(task => task.id);
      const tasksToDeleteFromOrder: { [key in TaskState]?: string[] } = {};

      // собираем список задач, которые надо удалить
      (Object.keys(this.tasksOrderByState) as unknown as (keyof TaskOrderByStateType)[]).forEach((state) => {
        Object.keys(this.tasksOrderByState![state] as TaskOrderType).forEach(taskID => {
          if (!newTasksIDs.includes(taskID)) {
            if (!tasksToDeleteFromOrder[state]) { tasksToDeleteFromOrder[state] = [taskID];  }
            else { tasksToDeleteFromOrder[state]!.push(taskID); }
          }
        })
      });

      (Object.keys(tasksToDeleteFromOrder) as unknown as (keyof TaskOrderByStateType)[]).forEach(state => {
        tasksToDeleteFromOrder[state]!.forEach(taskIDToDelete => delete this.tasksOrderByState[state]![taskIDToDelete]);
      })
    }
    const updateTaskHandler = (updatedTask: IUpdatedTaskMsg) => {
      if (!updatedTask.taskId) { this.initStore(removeDeletedItemFromOrder); }
      else {
        this.getByIDHttp$(updatedTask.taskId)
            .pipe(
                tap(updatedTask => {
                  const previousState = this.getByID(updatedTask.id);
                  const isCreated = !previousState;
                  this.upsertEntities([updatedTask]);
                  if (isCreated) { this.addToTaskOrderState(updatedTask.id, updatedTask.state); }
                  else if (previousState) { this.switchStateInOrderState(updatedTask.id, previousState.state, updatedTask.state); }
                })
            ).subscribe();
      }
    }

    this.crmSocketS.listenMethod('Changes', updateTaskHandler);
  }
}

interface IUpdatedTaskMsg {
  taskId?: string;
}

export type TaskOrderType = { [taskID: string]: number; }
type TaskOrderByStateType = { [key in TaskState]?: TaskOrderType };
