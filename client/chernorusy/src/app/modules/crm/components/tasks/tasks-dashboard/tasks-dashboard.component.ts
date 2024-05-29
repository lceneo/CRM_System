import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TaskState} from "../../../helpers/enums/TaskState";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {TaskService} from "../../../services/task.service";
import {ITask} from "../../../helpers/entities/ITask";
import {ColumnService} from "../../../services/column.service";

@Component({
  selector: 'app-tasks-dashboard',
  templateUrl: './tasks-dashboard.component.html',
  styleUrls: ['./tasks-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksDashboardComponent {

  constructor(
      private columnS: ColumnService,
      private taskS: TaskService
  ) {}

  protected columns = this.columnS.getEntitiesSortedAsync();


  dropTask(event: CdkDragDrop<ITask[]>, newColumnId: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex,
      );
      this.taskS.updateHTTP$({id: event.item.data.id, columnId: newColumnId}).subscribe();
    }
  }

  protected readonly TaskState = TaskState;
}

