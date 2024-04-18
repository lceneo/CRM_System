import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {TaskService} from "../../../services/task.service";
import {ITask} from "../../../helpers/entities/ITask";

@Component({
  selector: 'app-modal-delete-task',
  templateUrl: './modal-delete-task.component.html',
  styleUrls: ['./modal-delete-task.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalDeleteTaskComponent {

  constructor(
      private taskS: TaskService,
      private matDialogRef: MatDialogRef<string>,
      @Inject(MAT_DIALOG_DATA) protected taskToDeleteID: string
  ) {
    this.taskToDelete = this.taskS.getByID(taskToDeleteID);
  }

  deleteTask() {
    this.matDialogRef.close(true);
  }

  protected taskToDelete?: ITask;
}
