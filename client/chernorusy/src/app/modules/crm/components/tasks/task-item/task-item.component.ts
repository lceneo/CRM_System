import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ITask} from "../../../helpers/entities/ITask";
import {TaskState} from "../../../helpers/enums/TaskState";
import {TaskOrderType, TaskService} from "../../../services/task.service";
import {MatDialog} from "@angular/material/dialog";
import {ModalDeleteTaskComponent} from "../modal-delete-task/modal-delete-task.component";
import {filter, switchMap} from "rxjs";
import {ModalCreateTaskComponent} from "../modal-create-task/modal-create-task.component";
import {ModalTaskInfoComponent} from "../modal-task-info/modal-task-info.component";
import {IColumn} from "../../../helpers/entities/IColumn";
import {ColumnService} from "../../../services/column.service";

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskItemComponent  {

  constructor(
    private columnS: ColumnService,
    private taskS: TaskService,
    private matDialog: MatDialog
  ) {}

 @Input({required: true}) tasks: ITask[] = [];
 @Input({required: true}) set columnID(id: string) {
   this.column = this.columnS.getByID(id);
 }

 protected column?: IColumn;
  openModalCreateTask() {
   this.matDialog.open(ModalCreateTaskComponent, {disableClose: true, autoFocus: false, data: this.column?.id});
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
    this.matDialog.open(ModalTaskInfoComponent, { autoFocus: false, disableClose: true, data: task.id });
  }
   trackTask(index : number, task: ITask) {
    return task.id;
 }

}
