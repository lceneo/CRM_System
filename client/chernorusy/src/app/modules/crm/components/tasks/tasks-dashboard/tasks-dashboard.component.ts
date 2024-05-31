import { computed } from '@angular/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TaskState } from '../../../helpers/enums/TaskState';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { TaskService } from '../../../services/task.service';
import { ITask } from '../../../helpers/entities/ITask';
import { ColumnService } from '../../../services/column.service';
import { ModalCreateUpdateProductComponent } from '../../products/modal-create-update-product/modal-create-update-product.component';
import { ModalDeleteProductComponent } from '../../products/modal-delete-product/modal-delete-product.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalCreateUpdateColumnComponent } from '../modal-create-update-column/modal-create-update-column.component';

@Component({
  selector: 'app-tasks-dashboard',
  templateUrl: './tasks-dashboard.component.html',
  styleUrls: ['./tasks-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksDashboardComponent {
  constructor(
    private columnS: ColumnService,
    private taskS: TaskService,
    private matDialog: MatDialog
  ) {}

  protected columns = this.columnS.getEntitiesSortedAsync();

  tasks = this.taskS.getEntitiesAsync();
  clientsOnTasks = computed(() =>
    this.tasks()
      ?.map((task) => task.client?.id)
      .filter(Boolean)
  );
  taskExecutioners = computed(() =>
    this.tasks()
      ?.map((task) => task.assignedTo?.id)
      .filter(Boolean)
  );

  dropTask(event: CdkDragDrop<ITask[]>, newColumnId: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.taskS
        .updateHTTP$({ id: event.item.data.id, columnId: newColumnId })
        .subscribe();
    }
  }

  openCreateColumnModal() {
    this.matDialog.open(ModalCreateUpdateColumnComponent, {
      data: { mode: 'create' },
      autoFocus: false,
    });
  }

  openUpdateColumnModal(columnId: string) {
    this.matDialog.open(ModalCreateUpdateColumnComponent, {
      data: { mode: 'edit', columnId },
      autoFocus: false,
    });
  }

  openDeleteColumnModal(columnId: string) {
    this.matDialog.open(ModalDeleteProductComponent, {
      data: columnId,
      autoFocus: false,
    });
  }

  protected readonly TaskState = TaskState;
}
