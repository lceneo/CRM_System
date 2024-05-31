import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ITask } from '../../../helpers/entities/ITask';
import { TaskState } from '../../../helpers/enums/TaskState';
import { TaskOrderType, TaskService } from '../../../services/task.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalDeleteTaskComponent } from '../modal-delete-task/modal-delete-task.component';
import { filter, Subject, switchMap } from 'rxjs';
import { ModalCreateTaskComponent } from '../modal-create-task/modal-create-task.component';
import { ModalTaskInfoComponent } from '../modal-task-info/modal-task-info.component';
import { IColumn } from '../../../helpers/entities/IColumn';
import { ColumnService } from '../../../services/column.service';
import { ColorConverterService } from '../../../../../shared/services/color-converter.service';
import { ModalDeleteColumnComponent } from '../modal-delete-column/modal-delete-column.component';
import { ModalCreateUpdateProductComponent } from '../../products/modal-create-update-product/modal-create-update-product.component';
import { ModalCreateUpdateColumnComponent } from '../modal-create-update-column/modal-create-update-column.component';
import { getFio } from 'src/app/shared/helpers/get-fio';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskItemComponent {
  constructor(
    private columnS: ColumnService,
    private taskS: TaskService,
    private colorConverterS: ColorConverterService,
    private matDialog: MatDialog
  ) {}

  @Input({ required: true }) tasks: ITask[] = [];
  @Input({ required: true }) set columnID(id: string) {
    this.column = this.columnS.getByID(id);
    this.headerBgColor = this.colorConverterS.hex2rgba(this.column!.color, 1);
    this.headerBorderColor = this.colorConverterS.hex2rgba(
      this.column!.color,
      0.9
    );
    this.columnBgColor = this.colorConverterS.hex2rgba(this.column!.color, 0.3);
    this.headerBgColorChanged$.next();
  }

  protected column?: IColumn;
  @HostBinding('style.backgroundColor')
  protected columnBgColor?: string;
  protected headerBgColor?: string;
  protected headerBgColorChanged$ = new Subject<void>();
  protected headerBorderColor?: string;
  openModalCreateTask() {
    this.matDialog.open(ModalCreateTaskComponent, {
      disableClose: true,
      autoFocus: false,
      data: this.column?.id,
    });
  }
  deleteTask(taskID: string) {
    this.matDialog
      .open(ModalDeleteTaskComponent, { data: taskID, autoFocus: false })
      .afterClosed()
      .pipe(
        filter((result) => !!result),
        switchMap(() => this.taskS.deleteByIDHTTP$(taskID))
      )
      .subscribe();
  }

  openModalTaskInfo(task: ITask) {
    this.matDialog.open(ModalTaskInfoComponent, {
      autoFocus: false,
      disableClose: true,
      data: task.id,
    });
  }
  openModalEditColumn(columnId: string) {
    this.matDialog.open(ModalCreateUpdateColumnComponent, {
      data: { mode: 'edit', columnId },
      autoFocus: false,
    });
  }

  openModalDeleteColumn(columnId: string) {
    this.matDialog.open(ModalDeleteColumnComponent, {
      data: columnId,
      autoFocus: false,
    });
  }
  trackTask(index: number, task: ITask) {
    return task.id;
  }

  protected readonly getFio = getFio;
}
