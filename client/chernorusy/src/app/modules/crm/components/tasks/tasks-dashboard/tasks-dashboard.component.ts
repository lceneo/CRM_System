import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TaskState} from "../../../helpers/enums/TaskState";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {TaskOrderType, TaskService} from "../../../services/task.service";
import {ITask} from "../../../helpers/entities/ITask";

@Component({
  selector: 'app-tasks-dashboard',
  templateUrl: './tasks-dashboard.component.html',
  styleUrls: ['./tasks-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksDashboardComponent {

  constructor(
      private taskS: TaskService
  ) {}

  protected newTasks = this.taskS.getEntitiesAsync(t => t.state === TaskState.New);
  protected pausedTasks = this.taskS.getEntitiesAsync(t => t.state === TaskState.Pause);
  protected inProgressTasks = this.taskS.getEntitiesAsync(t => t.state === TaskState.InProgress);
  protected doneTasks = this.taskS.getEntitiesAsync(t => t.state === TaskState.Done);
  protected archivedTasks = this.taskS.getEntitiesAsync(t => t.state === TaskState.Archived);


  dropTask(event: CdkDragDrop<ITask[]>, newTaskState: TaskState) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex,
      );
      this.taskS.updateHTTP$({id: event.item.data.id, state: newTaskState}).subscribe();
      // спс антону за кошерный бек
      // this.taskS.removeFromStateOrder(+event.previousContainer.id, event.item.data.id);
    }

    const orderByTaskID: TaskOrderType = event.container.data.reduce((prev, curr, i) => ({...prev, [curr.id]: i}), {});
    this.taskS.saveStateOrder(newTaskState, orderByTaskID);
  }

  protected readonly TaskState = TaskState;
}

