import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ITask} from "../../helpers/entities/ITask";
import {TaskState} from "../../helpers/enums/TaskState";
import {TaskService} from "../../services/task.service";
import {MatDialog} from "@angular/material/dialog";
import {ModalDeleteTaskComponent} from "../modal-delete-task/modal-delete-task.component";
import {filter, switchMap} from "rxjs";

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskItemComponent {

 @Input({required: true}) tasks: ITask[] = [];
 @Input({required: true}) header?: string;

 constructor(
     private taskS: TaskService,
     private matDialog: MatDialog
 ) {}
 deleteTask(taskID: string) {
     this.matDialog.open(ModalDeleteTaskComponent, {data: taskID, autoFocus: false})
         .afterClosed()
         .pipe(
             filter(result => !!result),
             switchMap(() => this.taskS.deleteByIDHTTP$(taskID))
         ).subscribe();
 }
 trackTask(index : number, task: ITask) {
    return task.id;
 }

}
