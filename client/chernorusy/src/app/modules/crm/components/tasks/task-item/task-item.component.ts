import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ITask} from "../../../helpers/entities/ITask";
import {TaskState} from "../../../helpers/enums/TaskState";
import {TaskService} from "../../../services/task.service";
import {MatDialog} from "@angular/material/dialog";
import {ModalDeleteTaskComponent} from "../modal-delete-task/modal-delete-task.component";
import {filter, switchMap} from "rxjs";
import {ModalCreateTaskComponent} from "../modal-create-task/modal-create-task.component";
import {ModalTaskInfoComponent} from "../modal-task-info/modal-task-info.component";

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskItemComponent {

 @Input({required: true}) tasks: ITask[] = [];
 @Input({required: true}) set taskState (value: TaskState) {
   this._taskState = value;
   switch (value) {
     case TaskState.New:
       this.header = 'Новые'
       break;
     case TaskState.Pause:
       this.header = 'Приостановленные'
       break;
     case TaskState.InProgress:
       this.header = 'В работе'
       break;
     case TaskState.Done:
       this.header = 'Выполненные'
       break;
     case TaskState.Archived:
       this.header = 'Архив'
       break;
   }
 }

 get taskState() {
   return this._taskState as TaskState;
 }

 constructor(
     private taskS: TaskService,
     private matDialog: MatDialog
 ) {}

  protected header?: string;
  private _taskState?: TaskState;
  openModalCreateTask() {
   this.matDialog.open(ModalCreateTaskComponent, {disableClose: true, autoFocus: false, data: this.taskState});
  }
   deleteTask(taskID: string) {
     this.matDialog.open(ModalDeleteTaskComponent, {data: taskID, autoFocus: false})
         .afterClosed()
         .pipe(
             filter(result => !!result),
             switchMap(() => this.taskS.deleteByIDHTTP$(taskID))
         ).subscribe();
 }

  openModalTaskInfo(task: ITask) {
    this.matDialog.open(ModalTaskInfoComponent, { autoFocus: false, disableClose: true, data: { taskID: task.id, header: this.header } });
  }
   trackTask(index : number, task: ITask) {
    return task.id;
 }

}
